import os
import sys
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["UPLOAD_FOLDER"] = f"{_tmp}/uploads"
os.environ["JWT_SECRET"] = "knowledgecanvas_secret_key_123456789"
os.environ["AUTH_REQUIRED"] = "true"
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
