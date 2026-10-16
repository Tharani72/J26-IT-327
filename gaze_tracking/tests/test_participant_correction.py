"""Synthetic exclusion, byte preservation and interrupted-publication tests.

Participant/session identifiers are fictional test labels chosen for this file;
none were sourced from research datasets, registries, or session logs.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
import threading
from contextlib import contextmanager
import pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import participant_correction as correction
from dataset_guard import dataset_guard, LOCK, MARKER
from session_storage import atomic_write_json,session_lock
from test_auto_pilot import run_pilot


def test_guard_read_only_without_adoption(tmp_path):
    with dataset_guard(tmp_path):pass
    assert not list(tmp_path.iterdir())


def test_cross_process_exclusion(tmp_path):
    code='import sys;sys.path.insert(0,sys.argv[1]);from dataset_guard import dataset_guard;\nwith dataset_guard(sys.argv[2]):print("UNSAFE")'
    with dataset_guard(tmp_path,adopt=True):
        result=subprocess.run([sys.executable,'-B','-c',code,str(Path(__file__).resolve().parents[1]),str(tmp_path)],capture_output=True,text=True)
        assert result.returncode!=0 and 'UNSAFE' not in result.stdout
    with dataset_guard(tmp_path):pass


def test_crash_marker_blocks_audit_and_collection(tmp_path):
    from research_dataset import audit,export_split
    from live_calibration import collect
    from config import Config
    with dataset_guard(tmp_path,adopt=True):
        (tmp_path/MARKER).write_text('{}')
    for function in (lambda:audit(tmp_path), lambda:export_split(tmp_path,tmp_path/'export.json'),
                     lambda:collect('SYNTHETIC_TEST_A','MOCK_SESSION_001',Config(data_dir=tmp_path),adult_pilot_confirmed=True)):
        with pytest.raises(RuntimeError,match='correction pending'):function()
    assert not (tmp_path/'export.json').exists()


@pytest.mark.skipif(os.name!='nt',reason='Windows publication semantics')
def test_source_lock_survives_directory_rename(tmp_path):
    # Retained regression name; protection now survives through EXTERNAL guard.
    root=tmp_path/'study';source=root/'SYNTHETIC_TEST_A/MOCK_SESSION_001';source.mkdir(parents=True)
    (source/'.session.lock').write_bytes(b'0');archive=tmp_path/'archive'
    with dataset_guard(root,administrative=True,adopt=True):
        with correction.source_lock(source):
            with pytest.raises(RuntimeError):
                with session_lock(source):pass
        # Session handle is closed, external guard still held.
        correction.rename_exclusive(source,archive)
        assert (root/'.study-operation.lock').exists()
    assert (archive/'.session.lock').read_bytes()==b'0'


def test_staged_real_synthetic_integrity_and_pngs(tmp_path,monkeypatch):
    source=run_pilot(tmp_path/'study',monkeypatch,user='SYNTHETIC_TEST_A',session='MOCK_SESSION_001')[0]
    operation=tmp_path/'private';operation.mkdir();shutil.copytree(source,operation/'original')
    original=correction.hashes(source)
    manifest=dict(original_participant_id='SYNTHETIC_TEST_A',corrected_participant_id='SYNTHETIC_TEST_B',
        destination=str(source.parent.parent/'SYNTHETIC_TEST_B/MOCK_SESSION_001'),session_id='MOCK_SESSION_001',
        correction_id='MOCK_CORRECTION_001',reason='Synthetic identity correction',original_files=original)
    stage,result=correction.stage(operation,manifest)
    assert correction.hashes(source)==original
    assert correction.hashes(operation/'original')==original
    assert correction.build_summary(stage)['integrity']['usable_complete_session']
    assert all(correction.hashes(stage)[name]==digest for name,digest in original.items() if name.endswith('.png'))
    old=(source/'samples.csv').read_bytes().splitlines(keepends=True)
    new=(stage/'samples.csv').read_bytes().splitlines(keepends=True)
    assert old[0]==new[0] and all(a.split(b',',1)[1]==b.split(b',',1)[1] for a,b in zip(old[1:],new[1:]))
    assert all('participant_id' not in name for name in result['files_after'] if name.endswith('.png'))


def setup_operation(tmp_path,monkeypatch):
    root=tmp_path/'study';source=root/'SYNTHETIC_TEST_A/MOCK_SESSION_001';source.mkdir(parents=True)
    (source/'.session.lock').write_bytes(b'0');(source/'image_records').mkdir()
    (source/'image_records/F.json').write_text('[]');(source/'image.png').write_bytes(b'synthetic pixels')
    other=root/'SYNTHETIC_TEST_B/MOCK_SESSION_002';other.mkdir(parents=True);(other/'untouched').write_bytes(b'keep')
    operation=tmp_path/'private';operation.mkdir();shutil.copytree(source,operation/'original')
    original=correction.hashes(source)
    manifest=dict(correction_id='MOCK_CORRECTION_001',source=str(source),destination=str(root/'SYNTHETIC_TEST_B/MOCK_SESSION_001'),
        original_participant_id='SYNTHETIC_TEST_A',corrected_participant_id='SYNTHETIC_TEST_B',session_id='MOCK_SESSION_001',
        original_files=original,dataset_before=correction.hashes(root),before_distribution={'SYNTHETIC_TEST_C':1,'SYNTHETIC_TEST_A':2,'SYNTHETIC_TEST_B':1},
        before_observations=4,png_count=1,historical_classification=[])
    atomic_write_json(operation/'backup_manifest.v1.json',manifest)
    atomic_write_json(operation/'journal.v1.json',dict(state='BACKUP_VERIFIED',correction_id='MOCK_CORRECTION_001'))
    def stage(op,m):
        folder=op/'staged_session';shutil.copytree(op/'original',folder)
        result=dict(files_after=correction.hashes(folder))
        atomic_write_json(op/'file_hashes.v1.json',result)
        return folder,result
    monkeypatch.setattr(correction,'stage',stage)
    monkeypatch.setattr(correction,'classify_historical',lambda *a,**k:{'synthetic':True})
    monkeypatch.setattr(correction,'stale_references',lambda *a:[])
    monkeypatch.setattr(correction,'build_summary',lambda *a:{'integrity':{'usable_complete_session':True}})
    report=dict(observation_count=4,distribution={'SYNTHETIC_TEST_C':1,'SYNTHETIC_TEST_A':1,'SYNTHETIC_TEST_B':2},failures=[],label_semantics='Instructed fixation',
        observations=[dict(participant_id=p,session_id='MOCK_SESSION_001',frame_id=str(i),image_variants=[]) for i,p in enumerate(('SYNTHETIC_TEST_C','SYNTHETIC_TEST_A','SYNTHETIC_TEST_B','SYNTHETIC_TEST_B'))])
    monkeypatch.setattr(correction,'audit',lambda *a:report)
    return root,source,other,operation,original


@pytest.mark.skipif(os.name!='nt',reason='Windows publication semantics')
@pytest.mark.parametrize('interrupt',['STAGED_VERIFIED','ARCHIVING_SOURCE','SOURCE_ARCHIVED','DESTINATION_PUBLISHED','COMPLETE'])
def test_interruption_recovery_never_duplicates_active_sessions(tmp_path,monkeypatch,interrupt):
    root,source,other,operation,original=setup_operation(tmp_path,monkeypatch)
    def fault(state):
        if state==interrupt:raise RuntimeError('Synthetic interruption')
    with pytest.raises(RuntimeError,match='Synthetic interruption'):correction.run(operation,fault=fault)
    assert not(source.exists() and (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001').exists())
    assert correction.hashes(operation/'original')==original
    assert (root/MARKER).exists()
    correction.run(operation,resume=True)
    assert not source.exists() and (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001').is_dir()
    assert correction.hashes(operation/'archived_source')==original
    assert (other/'untouched').read_bytes()==b'keep' and not (root/MARKER).exists()


def test_backup_corruption_stops_before_adoption(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    (op/'original/image.png').write_bytes(b'corrupted')
    with pytest.raises(ValueError,match='Backup verification'):correction.run(op)
    assert correction.hashes(source)==original and not (root/MARKER).exists()


def test_destination_collision_preserved(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    destination=root/'SYNTHETIC_TEST_B/MOCK_SESSION_001';destination.mkdir();(destination/'existing').write_bytes(b'keep')
    with pytest.raises(RuntimeError,match='Duplicate'):correction.run(op)
    assert (destination/'existing').read_bytes()==b'keep' and correction.hashes(source)==original


def test_recovery_refuses_changed_staging(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    def stop(state):
        if state=='STAGED_VERIFIED':raise RuntimeError('Synthetic interruption')
    with pytest.raises(RuntimeError):correction.run(op,fault=stop)
    (op/'staged_session/image.png').write_bytes(b'changed')
    with pytest.raises(ValueError,match='Partial/changed'):correction.run(op,resume=True)
    assert correction.hashes(source)==original


@pytest.mark.skipif(os.name!='nt',reason='Windows handles')
@pytest.mark.parametrize('handle_kind',['python_open','native_share_delete','session_byte_lock'])
def test_exact_internal_handle_blocks_then_close_allows_rename(tmp_path,handle_kind):
    import ctypes
    source=tmp_path/'source';source.mkdir();path=source/'.session.lock';path.write_bytes(b'0')
    destination=tmp_path/'destination'
    @contextmanager
    def native():
        kernel=ctypes.WinDLL('kernel32',use_last_error=True)
        create=kernel.CreateFileW
        create.argtypes=[ctypes.c_wchar_p,ctypes.c_uint32,ctypes.c_uint32,ctypes.c_void_p,ctypes.c_uint32,ctypes.c_uint32,ctypes.c_void_p]
        create.restype=ctypes.c_void_p
        handle=create(str(path),0xC0000000,7,None,3,0x80,None)
        assert handle!=ctypes.c_void_p(-1).value
        close=kernel.CloseHandle;close.argtypes=[ctypes.c_void_p]
        try:yield
        finally:assert close(handle)
    context=path.open('r+b') if handle_kind=='python_open' else native() if handle_kind=='native_share_delete' else session_lock(source)
    with context:
        with pytest.raises(PermissionError) as failure:correction.rename_exclusive(source,destination)
        assert failure.value.winerror==5 and source.exists() and not destination.exists()
    correction.rename_exclusive(source,destination)
    assert (destination/'.session.lock').read_bytes()==b'0'


def test_all_public_dataset_paths_refuse_cross_process_access(tmp_path):
    root=tmp_path/'study';root.mkdir()
    script=r'''
import sys,json
from pathlib import Path
from types import SimpleNamespace
sys.path.insert(0,sys.argv[1])
from live_calibration import collect
from config import Config
from session_storage import new_session,session_lock,recover_interrupted_session
from research_dataset import audit,export_split,enrollment
from session_report import build_summary,write_session_report
from image_storage import ImagePairStore,reconcile_image_session,validate_image_pair
from multi_resolution import MultiResolutionStore,reconcile_multi
from target_collection import validate_target_collection,recover_collection_session
from pilot_session import validate_pilot_samples
from personalization import train_and_compare
from collect_data import main as legacy_main
import collect_data
root=Path(sys.argv[2]);folder=root/'SYNTHETIC_TEST_A/MOCK_SESSION_001';csv=folder/'samples.csv'
def create():
 with new_session(folder,{}):raise AssertionError('UNSAFE')
def lease():
 with session_lock(folder):raise AssertionError('UNSAFE')
collect_data.parse_args=lambda:SimpleNamespace(outdir=str(root))
operations={
 'collect':lambda:collect('SYNTHETIC_TEST_A','MOCK_SESSION_001',Config(data_dir=root),adult_pilot_confirmed=True),
 'new_session':create,'session_lock':lease,'recover_manifest':lambda:recover_interrupted_session(folder),
 'audit':lambda:audit(root),'export':lambda:export_split(root,root/'export.json'),
 'enrollment':lambda:enrollment(root,'SYNTHETIC_TEST_A'),'summary':lambda:build_summary(folder),
 'report':lambda:write_session_report(folder),'baseline_store':lambda:ImagePairStore(folder),
 'multi_store':lambda:MultiResolutionStore(folder,None),
 'baseline_save':lambda:ImagePairStore.save(SimpleNamespace(folder=folder),None,None,{}),
 'multi_save':lambda:MultiResolutionStore.save(SimpleNamespace(folder=folder),None,None,{}),
 'baseline_integrity':lambda:reconcile_image_session(folder),'multi_integrity':lambda:reconcile_multi(folder),
 'pair_validation':lambda:validate_image_pair([],folder),'target_validation':lambda:validate_target_collection(csv,None),
 'pilot_validation':lambda:validate_pilot_samples(csv,None),'session_recovery':lambda:recover_collection_session(folder),
 'legacy_collect':legacy_main,'model_input':lambda:train_and_compare(csv,None)}
results=[]
for name,operation in operations.items():
 try:operation()
 except RuntimeError as error:
  assert 'Dataset operation already active' in str(error), (name,str(error));results.append(name)
 else:raise AssertionError('UNSAFE '+name)
print(json.dumps(results))
'''
    with dataset_guard(root,administrative=True,adopt=True):
        result=subprocess.run([sys.executable,'-B','-c',script,str(Path(__file__).resolve().parents[1]),str(root)],capture_output=True,text=True)
        assert result.returncode==0,result.stderr
        assert len(json.loads(result.stdout))==21
        assert not (root/'SYNTHETIC_TEST_A').exists() and not (root/'export.json').exists()


def test_thread_exclusion_and_no_privilege_upgrade(tmp_path):
    errors=[]
    with dataset_guard(tmp_path,adopt=True):
        def worker():
            try:
                with dataset_guard(tmp_path):errors.append('UNSAFE')
            except RuntimeError:errors.append('REFUSED')
        thread=threading.Thread(target=worker);thread.start();thread.join(timeout=5)
        assert not thread.is_alive() and errors==['REFUSED']
        with pytest.raises(RuntimeError,match='cannot upgrade'):
            with dataset_guard(tmp_path,administrative=True):pass


@pytest.mark.parametrize('step',['archive','publish'])
def test_permission_failure_preserves_data_then_explicit_resume(tmp_path,monkeypatch,step):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    rename=correction.rename_exclusive
    def fail(src,dst):
        if (step=='archive' and src==source) or (step=='publish' and dst==root/'SYNTHETIC_TEST_B/MOCK_SESSION_001'):
            raise PermissionError('Synthetic permission denial')
        rename(src,dst)
    monkeypatch.setattr(correction,'rename_exclusive',fail)
    with pytest.raises(PermissionError):correction.run(op)
    assert correction.hashes(op/'original')==original
    assert not(source.exists() and (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001').exists())
    assert correction.hashes(source if source.exists() else op/'archived_source')==original
    monkeypatch.setattr(correction,'rename_exclusive',rename)
    correction.run(op,resume=True)
    assert not source.exists() and (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001').exists()


def test_interrupted_staging_retained_and_rebuilt_from_verified_backup(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    stage=correction.stage
    def partial(*args):
        folder=op/'staged_session';folder.mkdir();(folder/'partial').write_bytes(b'partial output')
        raise InterruptedError('Synthetic staging interruption')
    monkeypatch.setattr(correction,'stage',partial)
    with pytest.raises(InterruptedError):correction.run(op)
    assert correction.hashes(source)==original and correction.hashes(op/'original')==original
    monkeypatch.setattr(correction,'stage',stage)
    correction.run(op,resume=True)
    retained=list(op.glob('interrupted_staging_*'))
    assert len(retained)==1 and (retained[0]/'partial').read_bytes()==b'partial output'


@pytest.mark.parametrize('state',['STAGING','STAGED_VERIFIED','ARCHIVING_SOURCE','SOURCE_ARCHIVED','DESTINATION_PUBLISHED','COMPLETE'])
def test_abrupt_process_exit_releases_guard_marker_still_blocks(tmp_path,monkeypatch,state):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    script=r'''
import sys,os,json,shutil
from pathlib import Path
sys.path.insert(0,sys.argv[1]);import participant_correction as c
from session_storage import atomic_write_json
op=Path(sys.argv[2])
c.classify_historical=lambda *a,**k:{}
c.stale_references=lambda *a:[]
c.build_summary=lambda *a:{'integrity':{'usable_complete_session':True}}
def stage(operation,manifest):
 folder=operation/'staged_session';shutil.copytree(operation/'original',folder)
 result=dict(files_after=c.hashes(folder));atomic_write_json(operation/'file_hashes.v1.json',result)
 return folder,result
c.stage=stage
c.audit=lambda *a:dict(observation_count=4,distribution={'SYNTHETIC_TEST_C':1,'SYNTHETIC_TEST_A':1,'SYNTHETIC_TEST_B':2},failures=[],label_semantics='Instructed fixation',observations=[dict(participant_id=p,session_id='MOCK_SESSION_001',frame_id=str(i),image_variants=[]) for i,p in enumerate(('SYNTHETIC_TEST_C','SYNTHETIC_TEST_A','SYNTHETIC_TEST_B','SYNTHETIC_TEST_B'))])
def crash(state):
 if state==sys.argv[3]:os._exit(73)
c.run(op,fault=crash)
raise AssertionError('Did not reach crash state')
'''
    child=subprocess.run([sys.executable,'-B','-c',script,str(Path(__file__).resolve().parents[1]),str(op),state],capture_output=True,text=True)
    assert child.returncode==73,child.stderr
    from research_dataset import audit
    with pytest.raises(RuntimeError,match='correction pending'):audit(root)
    assert correction.hashes(op/'original')==original and not(source.exists() and (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001').exists())
    correction.run(op,resume=True)
    assert not (root/MARKER).exists() and (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001').is_dir()


@pytest.mark.parametrize('problem',['unknown_state','wrong_id','advanced_without_marker','another_marker'])
def test_stale_or_unrelated_journals_fail_closed(tmp_path,monkeypatch,problem):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    journal=json.loads((op/'journal.v1.json').read_text())
    if problem=='unknown_state':journal['state']='BOGUS'
    elif problem=='wrong_id':journal['correction_id']='SYNTHETIC_TEST_B'
    elif problem=='advanced_without_marker':journal['state']='SOURCE_ARCHIVED'
    else:(root/MARKER).write_text(json.dumps(dict(correction_id='SYNTHETIC_TEST_B',operation='other')))
    atomic_write_json(op/'journal.v1.json',journal)
    with pytest.raises(RuntimeError):correction.run(op,resume=True)
    assert correction.hashes(source)==original and correction.hashes(op/'original')==original


def test_concurrent_correction_attempt_refused(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    code='import sys;sys.path.insert(0,sys.argv[1]);from participant_correction import run;from pathlib import Path;run(Path(sys.argv[2]))'
    with dataset_guard(root,administrative=True,adopt=True):
        child=subprocess.run([sys.executable,'-B','-c',code,str(Path(__file__).resolve().parents[1]),str(op)],capture_output=True,text=True)
        assert child.returncode!=0 and 'Dataset operation already active' in child.stderr
        assert not (root/MARKER).exists()
    assert correction.hashes(source)==original


def test_completed_resume_is_idempotent(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    correction.run(op);before=correction.hashes(root)
    correction.run(op,resume=True)
    assert correction.hashes(root)==before


def historical_fixture(tmp_path):
    root=tmp_path/'study';folder=root/'SYNTHETIC_TEST_HISTORY/MOCK_SESSION_001';folder.mkdir(parents=True)
    atomic_write_json(folder/'session.json',dict(status='collecting',user_id='SYNTHETIC_TEST_HISTORY',session_id='MOCK_SESSION_001',data_dir=str(tmp_path/'old_missing_location')))
    (folder/'samples.csv').write_bytes(b'synthetic history')
    for f in folder.iterdir():os.utime(f,(time.time()-172800,time.time()-172800))
    approved=[dict(path=str(folder),first_hashes=correction.hashes(folder))]
    return root,folder,approved


def test_historical_classification_preserves_status_and_all_bytes(tmp_path,monkeypatch):
    root,folder,approved=historical_fixture(tmp_path)
    before=correction.hashes(folder)
    monkeypatch.setattr(correction,'process_evidence',lambda:{'command_line_visibility':'LIMITED'})
    monkeypatch.setattr(correction.time,'sleep',lambda seconds:None)
    result=correction.classify_historical(root,approved)
    assert result['historical_sessions'][0]['classification']=='INACTIVE_HISTORICAL'
    assert correction.hashes(folder)==before and json.loads((folder/'session.json').read_text())['status']=='collecting'


@pytest.mark.parametrize('condition',['unknown','versioned','lock','recent','changed','live_location','process','activity'])
def test_historical_ambiguity_refused(tmp_path,monkeypatch,condition):
    root,folder,approved=historical_fixture(tmp_path)
    monkeypatch.setattr(correction,'process_evidence',lambda:{})
    monkeypatch.setattr(correction.time,'sleep',lambda seconds:None)
    if condition=='unknown':approved=[]
    elif condition=='versioned':
        data=json.loads((folder/'session.json').read_text());data['collector_id']='new';atomic_write_json(folder/'session.json',data)
    elif condition=='lock':(folder/'.session.lock').write_bytes(b'0')
    elif condition=='recent':os.utime(folder/'samples.csv',None)
    elif condition=='changed':(folder/'samples.csv').write_bytes(b'changed')
    elif condition=='live_location':(tmp_path/'old_missing_location').mkdir()
    elif condition=='process':
        def denied():raise RuntimeError('Unclassified process')
        monkeypatch.setattr(correction,'process_evidence',denied)
    else:
        monkeypatch.setattr(correction.time,'sleep',lambda seconds:(folder/'samples.csv').write_bytes(b'activity'))
    with pytest.raises(RuntimeError):correction.classify_historical(root,approved)


def test_unlisted_incomplete_history_is_not_changed(tmp_path,monkeypatch):
    root,folder,approved=historical_fixture(tmp_path)
    data=json.loads((folder/'session.json').read_text());data['status']='incomplete';atomic_write_json(folder/'session.json',data)
    before=correction.hashes(folder)
    monkeypatch.setattr(correction,'process_evidence',lambda:{})
    monkeypatch.setattr(correction.time,'sleep',lambda seconds:None)
    assert not correction.classify_historical(root,[])['historical_sessions']
    assert correction.hashes(folder)==before


def test_source_handle_from_nonparticipating_writer_refuses_probe(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    # Simulate a legacy external process: use the internal byte lease directly.
    from session_storage import _session_lock
    with _session_lock(source):
        with pytest.raises((RuntimeError,PermissionError)):correction.run(op)
    assert correction.hashes(source)==original and correction.hashes(op/'original')==original


def test_successful_synthetic_correction_with_real_integrity_audit(tmp_path,monkeypatch):
    from research_dataset import audit
    source=run_pilot(tmp_path/'study',monkeypatch,user='SYNTHETIC_TEST_A',session='MOCK_SESSION_001')[0];root=source.parent.parent
    old='SYNTHETIC_TEST_A';new='SYNTHETIC_TEST_B'
    def independent_session(participant,session):
        # Different people/sessions must not be fabricated by relabeling cloned pixels.
        # Generate real independent synthetic source frames through the collector.
        import numpy as np
        import test_auto_pilot as pilot
        original_frame=pilot.synthetic_frame
        rng=np.random.default_rng(sum(map(ord,participant+'_'+session)))
        def frame():
            image=original_frame()
            return np.clip(image.astype(np.int16)+rng.integers(-8,9,image.shape),0,255).astype(np.uint8)
        with monkeypatch.context() as isolated:
            isolated.setattr(pilot,'synthetic_frame',frame)
            target,_,_,_,failure=run_pilot(root,isolated,user=participant,session=session)
            assert failure is None
        assert correction.build_summary(target)['integrity']['usable_complete_session']
        return target
    other_sessions=[independent_session(old,'MOCK_SESSION_002'),independent_session(new,'MOCK_SESSION_002'),independent_session('SYNTHETIC_TEST_C','MOCK_SESSION_002')]
    before=audit(root);original=correction.hashes(source)
    op=tmp_path/'private';op.mkdir();shutil.copytree(source,op/'original')
    manifest=dict(schema_version='1.0.0',correction_id='MOCK_CORRECTION_001',source=str(source),destination=str(root/new/source.name),
        original_participant_id=old,corrected_participant_id=new,session_id=source.name,
        original_files=original,dataset_before=correction.hashes(root),before_distribution=before['distribution'],
        before_observations=before['observation_count'],png_count=sum(n.endswith('.png') for n in original),
        historical_classification=[],reason='Synthetic identity correction')
    atomic_write_json(op/'backup_manifest.v1.json',manifest)
    atomic_write_json(op/'journal.v1.json',dict(state='BACKUP_VERIFIED',correction_id='MOCK_CORRECTION_001'))
    monkeypatch.setattr(correction,'classify_historical',lambda *a,**k:{'synthetic':True})
    destination=correction.run(op)
    final=audit(root)
    n=before['distribution'][new]
    assert final['distribution']=={old:n,new:2*n,'SYNTHETIC_TEST_C':n} and final['observation_count']==before['observation_count']
    assert not source.exists() and destination.is_dir() and not (root/MARKER).exists()
    assert correction.hashes(op/'original')==original and correction.hashes(op/'archived_source')==original
    saved=correction.hashes(destination)
    assert all(saved[name]==digest for name,digest in original.items() if name.endswith('.png'))
    assert correction.build_summary(destination)['integrity']['usable_complete_session']
    for target in other_sessions:
        for name,digest in correction.hashes(target).items():
            assert manifest['dataset_before'][target.relative_to(root).as_posix()+'/'+name]==digest
    # Real provenance contains the OLD ID intentionally; resume must not flag it
    # as a stale export or republish a second session.
    snapshot=correction.hashes(root);correction.run(op,resume=True)
    assert correction.hashes(root)==snapshot


def test_changed_other_session_refused_before_publication(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    (other/'untouched').write_bytes(b'changed')
    with pytest.raises(ValueError,match='inventory changed'):correction.run(op)
    assert correction.hashes(source)==original and not (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001').exists()


def test_completed_stale_metadata_refuses_resume(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    correction.run(op)
    (root/'SYNTHETIC_TEST_B/MOCK_SESSION_001/image.png').write_bytes(b'changed')
    with pytest.raises(ValueError,match='Published hashes'):correction.run(op,resume=True)
    assert correction.hashes(op/'original')==original


def test_destination_created_at_publication_boundary_is_not_overwritten(tmp_path,monkeypatch):
    root,source,other,op,original=setup_operation(tmp_path,monkeypatch)
    destination=root/'SYNTHETIC_TEST_B/MOCK_SESSION_001'
    def race(state):
        if state=='SOURCE_ARCHIVED':destination.mkdir();(destination/'foreign').write_bytes(b'keep')
    with pytest.raises(FileExistsError):correction.run(op,fault=race)
    assert (destination/'foreign').read_bytes()==b'keep'
    assert not source.exists() and correction.hashes(op/'archived_source')==original
    with pytest.raises(ValueError,match='Published hashes'):correction.run(op,resume=True)
    assert correction.hashes(op/'original')==original


def test_stale_references_distinguish_corrected_provenance(tmp_path):
    root=tmp_path/'repo/gaze_tracking/data/personalization';root.mkdir(parents=True)
    source=root/'SYNTHETIC_TEST_A/MOCK_SESSION_001';destination=root/'SYNTHETIC_TEST_B/MOCK_SESSION_001';destination.mkdir(parents=True)
    atomic_write_json(destination/'participant_correction.v1.json',dict(original_participant_id='SYNTHETIC_TEST_A',session_id='MOCK_SESSION_001',correction_id='MOCK_CORRECTION_001'))
    assert not correction.stale_references(root,source,destination,'MOCK_CORRECTION_001')
    export=root/'old_split.json';atomic_write_json(export,dict(participant_id='SYNTHETIC_TEST_A',session_id='MOCK_SESSION_001'))
    assert correction.stale_references(root,source,destination,'MOCK_CORRECTION_001')==[export]


@pytest.mark.parametrize('adopted',[False,True])
def test_gui_validation_worker_uses_owner_lease_without_releasing_guard(tmp_path,monkeypatch,adopted):
    import guided_ui
    monkeypatch.setattr(guided_ui,'show_stage',lambda *a,**k:None)
    def validate():
        with dataset_guard(tmp_path):
            return 'validated'
    with dataset_guard(tmp_path,adopt=adopted):
        assert guided_ui.run_loading('SYNTHETIC_TEST_A',validate,'SAVING_RESULTS','synthetic')=='validated'


def test_delegated_worker_cannot_outlive_or_upgrade_owner(tmp_path):
    from dataset_guard import bind_worker
    with dataset_guard(tmp_path,adopt=True):
        def upgrade():
            with dataset_guard(tmp_path,administrative=True):return 'UNSAFE'
        with pytest.raises(RuntimeError,match='cannot upgrade'):bind_worker(upgrade)()
        delegated=bind_worker(lambda:'UNSAFE')
    with pytest.raises(RuntimeError,match='expired'):delegated()


def test_malformed_external_lock_refused(tmp_path):
    (tmp_path/LOCK).write_bytes(b'')
    with pytest.raises(RuntimeError,match='Malformed'):
        with dataset_guard(tmp_path):pass
