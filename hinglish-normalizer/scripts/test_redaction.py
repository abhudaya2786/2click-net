"""Unit tests for wake-word / command-trigger redaction."""

from redaction import redact_command_triggers


def test_strips_start_stop_save():
    raw = "2Click Start cement delivery kal subah Meeting khatam Save note"
    out = redact_command_triggers(raw)
    assert "2click start" not in out.lower()
    assert "meeting khatam" not in out.lower()
    assert "save note" not in out.lower()
    assert "cement delivery" in out.lower()


def test_strips_cancel():
    out = redact_command_triggers("Cancel recording please ignore")
    assert "cancel recording" not in out.lower()


def test_hindi_triggers():
    out = redact_command_triggers("मीटिंग शुरू करो कल सामान भेजना है मीटिंग खत्म")
    assert "मीटिंग शुरू करो" not in out
    assert "मीटिंग खत्म" not in out
    assert "सामान" in out


if __name__ == "__main__":
    test_strips_start_stop_save()
    test_strips_cancel()
    test_hindi_triggers()
    print("redaction tests OK")
