Instructions:-
1. Open this folder in a linux environment(For Windows, this is WSL).
2. run `python3 -m venv .venv` to create the virtual environment.
3. run `source .venv/bin/activate` to enter venv.
4. run `pip install -r requirements.txt` to install all the dependencies.
5. Ensure redis and mailhog is installed.
6. run `python3 app.py` to run the app.
7. run `celery -A app:celery_app worker -l info` to initialise the workers.
8. run `celery -A app:celery_app beat -l info` to initialise the workers.
9. run `~/go/bin/MailHog` to run the SMTP server

