# -*- coding: utf-8 -*-
"""Public section, including homepage and signup."""
from .search import Item
from .models import Page
from sqlalchemy.orm import aliased
from flaskshop.product.models import Product, Artist
from flaskshop.extensions import login_manager
from flaskshop.account.models import User
from pluggy import HookimplMarker
from flask import Blueprint, current_app, render_template, request, send_from_directory, flash, redirect, url_for
from flask_mail import Mail, Message


impl = HookimplMarker("flaskshop")


@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    return User.get_by_id(int(user_id))


def home():
    products = Product.get_featured_product()
    return render_template("public/home.html", products=products)


def style():
    return render_template("public/style_guide.html")


def favicon():
    return send_from_directory("static", "favicon-32x32.png")


def search():
    query = request.args.get("q", "")
    page = request.args.get("page", default=1, type=int)

    if current_app.config["USE_ES"]:
        pagination = Item.new_search(query, page)
    else:
        query = f"%{query}%"

        # Alias the Artist model for use in the subquery
        artist_subquery = aliased(Artist)

        pagination = Product.query.join(artist_subquery, artist_subquery.id == Product.artist_id).filter(
            (Product.title.ilike(query)) | (
                artist_subquery.title.ilike(query))
        ).paginate(page)

    return render_template(
        "public/search_result.html",
        products=pagination.items,
        query=query,
        pagination=pagination,
    )


def show_page(identity):
    page = Page.get_by_identity(identity)
    return render_template("public/page.html", page=page)


def show_contact_page():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')

        mail = Mail(current_app)
        # Send email
        msg = Message(subject='Contact Form Submission',
                      sender='YOUR_EMAIL@gmail.com', recipients=['YOUR_EMAIL@gmail.com'])
        msg.body = f"Name: {name}\nEmail: {email}\nMessage: {message}"
        mail.send(msg)

        flash('Your message has been sent!', 'success')
        # Redirect after POST to avoid form resubmission
        return redirect(url_for('bp.show_contact_page'))

    return render_template("public/contact_us.html")


@impl
def flaskshop_load_blueprints(app):
    bp = Blueprint("public", __name__)
    bp.add_url_rule("/", view_func=home)
    bp.add_url_rule("/style", view_func=style)
    bp.add_url_rule("/favicon.ico", view_func=favicon)
    bp.add_url_rule("/search", view_func=search)
    bp.add_url_rule("/page/<identity>", view_func=show_page)
    bp.add_url_rule("/contact-us", view_func=show_contact_page,
                    methods=["GET", "POST"])
    app.register_blueprint(bp)
