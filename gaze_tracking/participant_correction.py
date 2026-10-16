"""Journaled, no-overwrite correction of one approved participant attribution.

Requires a separately verified complete backup. Original data is never deleted.
Crash recovery resumes only known hash-verified states under the dataset guard.
"""
from contextlib import contextmanager
from datetime import datetime, timezone
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import time
import uuid

from dataset_guard import dataset_guard, LOCK, MARKER, safe_root, require_guard
from session_storage import atomic_write_json, session_lock
from session_report import build_summary, _html
from research_dataset import audit, prepare_split, exclusive_json


def hashes(folder, *, locked_byte=None, excluded=()):
    result = {}
    for path in sorted(Path(folder).rglob('*')):
        if path.is_symlink():
            raise ValueError('Symlink correction input refused')
        if path.is_file():
            name = path.relative_to(folder).as_posix()
            if name in excluded: continue
            data = locked_byte if name == '.session.lock' and locked_byte is not None else path.read_bytes()
            result[name] = hashlib.sha256(data).hexdigest()
    return result


@contextmanager
def source_lock(folder):
    """Probe the legacy session lease while the external correction guard is held.

    This INTERNAL handle must close before a directory move. Mutual exclusion
    continues through the external dataset guard, which every session-lock API
    now acquires before opening the session directory.
    """
    require_guard(Path(folder).resolve().parent.parent, administrative=True)
    with session_lock(folder):
        yield


def process_evidence():
    if os.name != 'nt':
        raise RuntimeError('Real preflight currently requires Windows process inventory')
    code = "@(Get-Process -ErrorAction Stop | Where-Object { $_.ProcessName -match '^(python.*|py)$' } | Select-Object Id,ProcessName) | ConvertTo-Json -Compress"
    result = subprocess.run(['powershell','-NoProfile','-Command',code], capture_output=True, text=True, check=True)
    found = json.loads(result.stdout) if result.stdout.strip() else []
    if isinstance(found, dict): found = [found]
    others = [p for p in found if p['Id'] != os.getpid()]
    if others:
        raise RuntimeError('Other Python processes make collection activity ambiguous: '+json.dumps(others))
    return dict(observed_at=datetime.now(timezone.utc).isoformat(), inspection_pid=os.getpid(),
        other_python_processes=[], command_line_visibility='CIM access denied; accessible process inventory only')


def classify_historical(root, approved, *, observation_seconds=20):
    """Exact allowlist + legacy format + old/stable bytes; never status alone."""
    if observation_seconds < 20:
        raise ValueError('Historical observation must span at least 20 seconds')
    evidence = process_evidence()
    observations = []
    known = {Path(item['path']).resolve(): item for item in approved}
    for manifest in Path(root).glob('*/*/session.json'):
        data = json.loads(manifest.read_text(encoding='utf-8'))
        if data.get('status') != 'collecting': continue
        folder = manifest.parent.resolve()
        if folder not in known or data.get('session_manifest_version') is not None or data.get('collector_id') is not None:
            raise RuntimeError('Unclassified collecting session: '+str(folder))
        if (folder/'.session.lock').exists() or Path(data['data_dir']).exists():
            raise RuntimeError('Historical lock or original live location is present')
        current = hashes(folder)
        if current != known[folder]['first_hashes'] or any(time.time()-f.stat().st_mtime < 86400 for f in folder.iterdir()):
            raise RuntimeError('Historical session changed or recently active')
        observations.append(dict(path=str(folder), hashes=current, classification='INACTIVE_HISTORICAL'))
    time.sleep(observation_seconds)
    for item in observations:
        if hashes(Path(item['path'])) != item['hashes']:
            raise RuntimeError('Historical session activity observed')
    return dict(before=evidence, after=process_evidence(), historical_sessions=observations,
                observation_seconds=observation_seconds)


def _replace_identity(value, old, new):
    if isinstance(value, dict):
        return {k: new if k in ('participant_id','user_id') and v == old else _replace_identity(v, old, new)
                for k, v in value.items()}
    if isinstance(value, list): return [_replace_identity(v, old, new) for v in value]
    return value


def stage(operation, manifest):
    backup = operation/'original'; folder = operation/'staged_session'
    if folder.exists():
        raise FileExistsError('Staging directory already exists; inspect journal before recovery')
    shutil.copytree(backup, folder, copy_function=shutil.copy2)
    old, new = manifest['original_participant_id'], manifest['corrected_participant_id']
    allowed = {'session.json','samples.csv','target_trials.v2.json','target_samples.v2.jsonl'}
    for name in manifest['original_files']:
        if name.startswith('image_records/') or (name.startswith('experimental_eye_images/') and name.endswith('/records.json')):
            allowed.add(name)
    for name in sorted(allowed):
        path = folder/name
        if path.suffix == '.json':
            atomic_write_json(path, _replace_identity(json.loads(path.read_text(encoding='utf-8')), old, new))
        elif path.suffix == '.jsonl':
            rows = [_replace_identity(json.loads(line), old, new) for line in path.read_text(encoding='utf-8').splitlines()]
            path.write_text(''.join(json.dumps(row, allow_nan=False)+'\n' for row in rows), encoding='utf-8')
        else:
            # Preserve every existing CSV byte except the first identity column.
            lines = path.read_bytes().splitlines(keepends=True)
            for index, line in enumerate(lines[1:], 1):
                prefix = (old+',').encode()
                if not line.startswith(prefix): raise ValueError('Unexpected CSV attribution')
                lines[index] = new.encode()+line[len(old):]
            path.write_bytes(b''.join(lines))
    summary = build_summary(folder)
    if not summary['integrity']['usable_complete_session']:
        raise ValueError('Corrected staged integrity failed')
    summary['output_folder'] = manifest['destination']
    report_paths = []
    for path in folder.glob('reports/*/summary.v1.json'):
        atomic_write_json(path, summary)
        html = path.with_name('index.html')
        if not html.is_file(): raise ValueError('Incomplete original report')
        html.write_text(_html(summary), encoding='utf-8')
        allowed.update((path.relative_to(folder).as_posix(), html.relative_to(folder).as_posix()))
        report_paths.append(path.relative_to(folder).as_posix())
    if not report_paths: raise ValueError('Original report absent')
    current = hashes(folder)
    changed = [name for name, digest in current.items() if manifest['original_files'].get(name) != digest]
    if set(current) != set(manifest['original_files']) or set(changed)-allowed:
        raise ValueError('Unexpected staged file changes')
    for name in allowed:
        if name.startswith('reports/') or name=='samples.csv': continue
        original = backup/name; corrected = folder/name
        def read(p):
            return [json.loads(line) for line in p.read_text(encoding='utf-8').splitlines()] if p.suffix=='.jsonl' else json.loads(p.read_text(encoding='utf-8'))
        if _replace_identity(read(original),old,new) != read(corrected):
            raise ValueError('Non-identity research metadata changed')
    provenance = dict(schema_version='1.0.0', correction_id=manifest['correction_id'],
        original_participant_id=old, corrected_participant_id=new, session_id=manifest['session_id'],
        reason=manifest['reason'], correction_timestamp_utc=datetime.now(timezone.utc).isoformat(),
        backup_manifest=str(operation/'backup_manifest.v1.json'), backup_verified=True)
    exclusive_json(folder/'participant_correction.v1.json', provenance)
    result = dict(files_before=manifest['original_files'], files_after=hashes(folder),
                  modified_original_files=changed, unchanged_pngs=sum(name.endswith('.png') for name in current),
                  provenance=provenance)
    atomic_write_json(operation/'file_hashes.v1.json',result)
    return folder, result


def rename_exclusive(source, destination):
    """Windows rename refuses existing destinations. No replacement fallback."""
    if os.name != 'nt': raise RuntimeError('Publication is implemented only for Windows')
    if destination.exists(): raise FileExistsError('Destination exists')
    os.rename(source, destination)


def stale_references(root, source, destination=None, correction_id=None):
    """Check repository-local derived artifacts; private originals are excluded."""
    repo = root.parents[2]
    found = []
    for base in ('gaze_tracking','frontend','backend'):
        directory = repo/base
        if not directory.is_dir(): continue
        for path in directory.rglob('*'):
            if not path.is_file() or any(p in path.parts for p in ('node_modules','__pycache__','private')):
                continue
            if path.is_relative_to(source): continue
            if destination is not None and path==destination/'participant_correction.v1.json':
                if json.loads(path.read_text(encoding='utf-8')).get('correction_id')!=correction_id:
                    raise RuntimeError('Unrelated correction provenance at destination')
                continue
            if path.suffix.lower() in ('.zip','.db','.sqlite','.sqlite3'):
                raise RuntimeError('Uninspectable archive/database requires explicit review: '+str(path))
            if path.suffix not in ('.json','.jsonl','.csv','.html'): continue
            text = path.read_text(encoding='utf-8')
            if source.parent.name in text and source.name in text:
                found.append(path)
    return found


def verify_other_files(root, manifest, *, published=False):
    ignored=[Path(manifest['source']).relative_to(root).as_posix()+'/']
    if published: ignored.append(Path(manifest['destination']).relative_to(root).as_posix()+'/')
    def others(values):
        return {k:v for k,v in values.items() if k not in (LOCK,MARKER) and not any(k.startswith(prefix) for prefix in ignored)}
    expected=others(manifest['dataset_before'])
    current=others(hashes(root,excluded=(LOCK,MARKER)))
    if current!=expected:
        raise ValueError('Other session/enrollment inventory changed since backup')
    return len(expected)


def run(operation, *, resume=False, fault=None):
    operation = safe_root(operation)
    manifest = json.loads((operation/'backup_manifest.v1.json').read_text(encoding='utf-8'))
    source, destination = Path(manifest['source']), Path(manifest['destination'])
    root = safe_root(source.parent.parent)
    safe_root(source); safe_root(destination)
    from config import safe_id
    for key in ('original_participant_id','corrected_participant_id','session_id','correction_id'):
        safe_id(manifest[key])
    if (source!=root/manifest['original_participant_id']/manifest['session_id'] or
            destination!=root/manifest['corrected_participant_id']/manifest['session_id'] or source==destination):
        raise ValueError('Invalid correction roots')
    if operation.is_relative_to(root) or not destination.parent.is_dir():
        raise ValueError('Private operation must be outside dataset; destination participant must exist')
    if os.stat(root).st_dev!=os.stat(operation).st_dev:
        raise ValueError('Correction requires same-volume publication; copying fallback refused')
    if hashes(operation/'original') != manifest['original_files']:
        raise ValueError('Backup verification failed')
    journal_path = operation/'journal.v1.json'
    journal = json.loads(journal_path.read_text(encoding='utf-8'))
    states={'BACKUP_VERIFIED','STAGING','STAGED_VERIFIED','ARCHIVING_SOURCE','SOURCE_ARCHIVED','DESTINATION_PUBLISHED','COMPLETE'}
    if journal.get('correction_id')!=manifest['correction_id'] or journal.get('state') not in states:
        raise RuntimeError('Unknown/stale correction journal; refused')
    if not resume and journal['state']!='BACKUP_VERIFIED':
        raise RuntimeError('Explicit --resume required for an interrupted correction')
    def checkpoint(state, **details):
        journal.update(state=state, updated_at=datetime.now(timezone.utc).isoformat(), **details)
        atomic_write_json(journal_path,journal)
        if fault: fault(state)
    with dataset_guard(root, administrative=True, adopt=True):
        if source.exists() and destination.exists():
            raise RuntimeError('Duplicate active source/destination; refused')
        marker = root/MARKER
        if marker.exists():
            marker_data=json.loads(marker.read_text())
            if marker_data.get('correction_id') != manifest['correction_id'] or marker_data.get('operation') != str(operation):
                raise RuntimeError('Another correction is pending')
        else:
            if journal['state'] not in ('BACKUP_VERIFIED','COMPLETE'): raise RuntimeError('Interrupted journal without marker')
            if journal['state']=='BACKUP_VERIFIED':
                exclusive_json(marker,dict(correction_id=manifest['correction_id'],operation=str(operation)))
        evidence = classify_historical(root, manifest['historical_classification'])
        atomic_write_json(operation/'preflight_evidence.v1.json',evidence)
        verify_other_files(root,manifest,published=destination.exists())
        # Refuse stale derived exports; quarantine requires a separate reviewed operation.
        references=stale_references(root,source,destination,manifest['correction_id'])
        if references:
            raise RuntimeError('Stale exports need explicit reviewed quarantine: '+str(references))
        archived = operation/'archived_source'
        staged = operation/'staged_session'
        # Determine crash state from hashes and locations, not only last journal write.
        if source.exists() and destination.exists(): raise RuntimeError('Duplicate active source/destination; refused')
        if source.exists():
            if archived.exists(): raise RuntimeError('Unexpected archive collision')
            if hashes(source)!=manifest['original_files']: raise ValueError('Source changed since backup')
            if destination.exists(): raise FileExistsError('Destination already exists')
            if staged.exists() and not (operation/'file_hashes.v1.json').exists():
                if not resume or journal['state'] not in ('BACKUP_VERIFIED','STAGING'):
                    raise RuntimeError('Interrupted staging requires explicit recovery')
                # Preserve partial output for audit; rebuild only from verified backup.
                rename_exclusive(staged,operation/('interrupted_staging_'+uuid.uuid4().hex))
            if not staged.exists():
                if journal['state'] not in ('BACKUP_VERIFIED','STAGING'): raise RuntimeError('Staging absent in advanced journal')
                checkpoint('STAGING')
                staged,result = stage(operation,manifest)
                checkpoint('STAGED_VERIFIED')
            else:
                result=json.loads((operation/'file_hashes.v1.json').read_text())
                if hashes(staged)!=result['files_after']: raise ValueError('Partial/changed staging; fail closed')
            lock_bytes=(source/'.session.lock').read_bytes()
            with source_lock(source):
                if hashes(source,locked_byte=lock_bytes)!=manifest['original_files']: raise ValueError('Source changed before archive')
            # No handle inside either directory remains open. The external lock
            # and durable marker continue excluding collection/audit/export.
            require_guard(root,administrative=True)
            if hashes(source)!=manifest['original_files']: raise ValueError('Source changed after lock probe')
            checkpoint('ARCHIVING_SOURCE')
            rename_exclusive(source,archived)
            checkpoint('SOURCE_ARCHIVED')
            rename_exclusive(staged,destination)
            checkpoint('DESTINATION_PUBLISHED')
        else:
            if not archived.exists() or hashes(archived)!=manifest['original_files']:
                raise ValueError('Original archived source absent or changed')
            result=json.loads((operation/'file_hashes.v1.json').read_text())
            if not destination.exists():
                if not staged.exists() or hashes(staged)!=result['files_after']:
                    raise ValueError('Recoverable staged data absent or changed')
                require_guard(root,administrative=True)
                rename_exclusive(staged,destination)
                checkpoint('DESTINATION_PUBLISHED')
        if hashes(destination)!=result['files_after']: raise ValueError('Published hashes differ')
        if hashes(archived)!=manifest['original_files']: raise ValueError('Archived original differs')
        report=audit(root)
        expected=dict(manifest['before_distribution'])
        pair_count=len(list((operation/'original/image_records').glob('*.json')))
        expected[manifest['original_participant_id']]-=pair_count
        expected[manifest['corrected_participant_id']]=expected.get(manifest['corrected_participant_id'],0)+pair_count
        if report['observation_count']!=manifest['before_observations'] or any(report['distribution'].get(k,0)!=v for k,v in expected.items()):
            raise ValueError('Participant totals failed')
        summary=build_summary(destination)
        if not summary['integrity']['usable_complete_session']: raise ValueError('Published integrity failed')
        split=prepare_split(report,mode='participant',seed=42)
        groups={p:{o['split'] for o in split['observations'] if o['participant_id']==p} for p in (manifest['original_participant_id'],manifest['corrected_participant_id'])}
        if any(len(v)!=1 for v in groups.values()):
            raise ValueError('Participant split grouping failed')
        other_count=verify_other_files(root,manifest,published=True)
        if hashes(operation/'original')!=manifest['original_files']: raise ValueError('Backup changed')
        atomic_write_json(operation/'verification.v1.json',dict(integrity_pass=True,
            participant_distribution=report['distribution'],observations=report['observation_count'],
            other_files_unchanged=other_count,pngs_unchanged=manifest['png_count'],backup_verified_files=len(manifest['original_files']),
            split_groups={k:sorted(v) for k,v in groups.items()},audit_failures=report['failures']))
        checkpoint('COMPLETE')
        if marker.exists(): marker.unlink()  # only this operation's administrative marker
        return destination


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--operation',type=Path,required=True)
    parser.add_argument('--resume',action='store_true')
    args=parser.parse_args()
    print(run(args.operation,resume=args.resume))


if __name__=='__main__': main()
