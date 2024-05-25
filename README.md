# Epicentrum Flaskshop

## Introduction

Epicentrum Art Gallery website/shop, developed using Flask.

## Features

- Multi-language and localization support

## Installation Guide

### Using Python Virtual Environment

1. Clone the repository and install dependencies:
    ```sh
    git clone https://github.com/itgoalsoftware/epicentrum-flaskshop.git
    cd flask-shop
    python3 -m venv .venv
    # On Windows, run .venv\Scripts\activate
    source .venv/bin/activate
    pip3 install -r requirements.txt
    ```

2. Initialize the database and run the application:
    ```sh
    # Create a .flaskenv file or modify flaskshop/setting.py
    flask createdb
    # Create fake data and an admin user for testing
    flask seed
    flask run
    ```

### Using Docker

1. Build the image and run it in the background:
    ```sh
    docker-compose up -d
    ```

2. Enter the container and add fake data:
    ```sh
    docker-compose exec web sh
    flask createdb
    flask seed
    ```

## Project Settings

To customize the default settings, create a `.flaskenv` file with the following content:

```ini
FLASK_APP=app.py
FLASK_ENV=develop
FLASK_DEBUG=1
FLASK_RUN_HOST=0.0.0.0
FLASK_RUN_PORT=5000
SECRET_KEY=abcdefgh
DB_TYPE=postgresql  # or mysql
DB_USER=root
DB_PASSWD=my_passwd
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=flaskshop
BABEL_DEFAULT_LOCALE=en_US
BABEL_DEFAULT_TIMEZONE=UTC
BABEL_TRANSLATION_DIRECTORIES=../translations
BABEL_CURRENCY=USD
GA_MEASUREMENT_ID=G-QCX3G9KSPC
```

Redis and Elasticsearch is disabled by default.

The default admin account is:

| username | password | role                |
|----------|----------|---------------------|
| admin    | admin    | super administrator |
| editor   | editor   | editor              |
| op       | op       | operator            |

### Frontend

[](https://github.com/hjlarry/flask-shop/wiki/Secondary-development#frontend)

The static assets is managed by webpack in `frontend` folder. And it is build to the `flaskshop/static/build` folder. If you modify any of it, you need to:

```
npm install
npm run build
```

Or you can run `npm run dev` for develop conveniently, `npm run lint` to use `eslint` fix the code format.

### Backend

The plugin system is based on [pluggy](https://github.com/pytest-dev/pluggy).

You can install the pluggin example `pip install -e ./plugin_example`, and then run the `flask createdb` to create the database of this plugin, now restart your server you will see the conversation in the frontend.


### Localization support

First, in the translation directory, check the `babel.cfg`.

```
cd translations
```

If you want to add a new language support, like `zh-CN`:

```
# create a new lang file
pybabel init -i messages.pot -d . -l zh_CN
# modify the zh_CN/messages.po file to your own language
# compile the translations
pybabel compile -d .
```

If you modify the source code, and need to update the exist translations:

```
# update the messages.pot
pybabel extract -F babel.cfg -k lazy_gettext -o messages.pot ../
# update the translations
pybabel update -i messages.pot -d . -l zh_CN
# then translate it and compile it
```

You can visit the `http://127.0.0.1:5000/?lang=bg` to change the frontend language.

Visit [flask_babel](https://python-babel.github.io/flask-babel/) to see more config and details.

# Contributing Guide

Thank you for contributing to the project.


Reporting issues
----------------


If you find a bug, or you think that flaskshop should provide a new feature/enhacement, feel free to create an issue on our [issue tracker](https://github.com/itgoalsoftware/epicentrum-flaskshop/issues).

Include the following information in your post:

-   Describe what you expected to happen.
-   Describe what actually happened. Include the full traceback if there was an exception.


### First time setup

-   Download and install the latest version of Git.
-   Configure git with your username and email.

```
$ git config --global user.name 'your name'
$ git config --global user.email 'your email'
```

-   Make sure you have a GitHub account.
-   Click the "[Fork][_fork]" button to fork the project on GitHub.
-   Clone your fork repository locally (replace `{username}` with your username):

```
$ git clone https://github.com/{username}/epicentrum-flaskshop
$ cd flask-shop
$ git remote add origin https://github.com/itgoalsoftware/epicentrum-flaskshop/

```

-   Create a virtual environment and install requirements:

```
$ python3 -m venv .venv
# For Windows, .venv\Scripts\activate
$ source .venv/bin/activate
$ python -m pip install --upgrade pip setuptools
$ pip install -r requirements.txt
$ pre-commit install
```

### Start coding

-   Create a new branch to address the issue you want to work on (be sure to update the example branch name):

```
$ git fetch origin
$ git checkout -b your-branch-name origin/main
```

-   Using your favorite editor, make your changes, [committing as you go](https://dont-be-afraid-to-commit.readthedocs.io/en/latest/git/commandlinegit.html#commit-your-changes).
-   Include tests that cover any code changes you make. Make sure the test fails without your patch. Run the tests as described below.
-   Push your commits to your fork on GitHub:

```
$ git push --set-upstream origin your-branch-name

```

-   [Create a pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request). Link to the issue being addressed with `fixes #123` in the pull request.

### Running the tests

[](https://github.com/hjlarry/flask-shop/wiki/Contributing-Guide#running-the-tests)

Run the basic test suite with pytest:

```
$ pytest
```