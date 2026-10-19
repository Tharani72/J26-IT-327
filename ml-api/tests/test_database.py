from app.database import AnalyticsRepository, DatabaseUnavailable


class FakeCursor:
    def __init__(self, role="omnisign_ml_reader", count=5):
        self.role = role
        self.count = count
        self.statements = []
        self.parameters = []
        self.result = None

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def execute(self, statement, parameters=None):
        self.statements.append(" ".join(statement.split()))
        self.parameters.append(parameters)
        if "current_user" in statement:
            self.result = {"ok": 1, "role": self.role}
        elif "visible_demo_students" in statement:
            self.result = {"visible_demo_students": self.count}

    def fetchone(self):
        return self.result


class FakeConnection:
    def __init__(self, cursor):
        self.fake_cursor = cursor

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def cursor(self):
        return self.fake_cursor


def test_read_only_connection_check_uses_reader_and_only_returns_demo_count():
    cursor = FakeCursor(count=5)
    repository = AnalyticsRepository()
    repository._connect = lambda: FakeConnection(cursor)

    assert repository.check_read_only() == 5
    assert cursor.statements[0] == "SET TRANSACTION READ ONLY"
    assert "SELECT 1" in cursor.statements[1]
    assert "current_user" in cursor.statements[1]
    assert "count(*)" in cursor.statements[2]
    assert "full_name" not in cursor.statements[2]
    assert cursor.parameters[2] == (["ST001", "ST002", "ST003", "ST004", "ST005"],)


def test_read_only_connection_check_rejects_non_reader_role():
    cursor = FakeCursor(role="postgres")
    repository = AnalyticsRepository()
    repository._connect = lambda: FakeConnection(cursor)

    try:
        repository.check_read_only()
        assert False, "non-reader role must not be accepted"
    except DatabaseUnavailable as exc:
        assert "role" in str(exc)