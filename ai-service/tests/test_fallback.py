from types import SimpleNamespace

from app.services import gemini_service as ai


class FakeModels:
    def __init__(self):
        self.tried = []

    def generate_content(self, model, contents, config=None):
        self.tried.append(model)
        if model != "gemini-3.5-flash":
            raise RuntimeError("404 NOT_FOUND: model is no longer available")
        return SimpleNamespace(text="hello")


def test_falls_back_when_model_is_retired(monkeypatch):
    models = FakeModels()
    monkeypatch.setattr(ai, "_get_client", lambda: SimpleNamespace(models=models))
    monkeypatch.setattr(ai, "GEMINI_MODEL", "gemini-2.5-flash")
    monkeypatch.setattr(ai, "_working_model", None)
    assert ai._generate("hi") == "hello"
    assert models.tried[0] == "gemini-2.5-flash" and models.tried[-1] == "gemini-3.5-flash"
    models.tried.clear()
    assert ai._generate("again") == "hello"
    assert models.tried == ["gemini-3.5-flash"]  # remembered


def test_other_errors_are_not_retried(monkeypatch):
    calls = []

    class Boom:
        def generate_content(self, model, contents, config=None):
            calls.append(model)
            raise RuntimeError("429 RESOURCE_EXHAUSTED")

    monkeypatch.setattr(ai, "_get_client", lambda: SimpleNamespace(models=Boom()))
    monkeypatch.setattr(ai, "_working_model", None)
    try:
        ai._generate("hi")
    except ai.AIServiceError as e:
        assert "429" in e.message
    assert len(calls) == 1
