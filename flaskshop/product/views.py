# -*- coding: utf-8 -*-
"""Product views."""
from flask import Blueprint, jsonify, redirect, render_template, request, url_for
from flask_login import login_required
from pluggy import HookimplMarker

from flaskshop.checkout.models import Cart

from .forms import AddCartForm
from .models import Artist, Product, ProductCollection, ProductVariant

impl = HookimplMarker("flaskshop")


def show(id, form=None):
    product = Product.get_by_id(id)
    if not form:
        form = AddCartForm(request.form, product=product)
    return render_template("products/details.html", product=product, form=form)


def show_product_by_full_title(product_title, form=None):
    product = Product.get_by_title(product_title)
    if not form:
        form = AddCartForm(request.form, product=product)
    return render_template("products/details.html", product=product, form=form)


def show_all_products():
    # page = request.args.get("page", 1, type=int)
    ctx = Product.get_all_products()
    ctx.update(object=artist, pagination=pagination,
               products=pagination.items)
    return render_template("products/index.html", **ctx)


@login_required
def product_add_to_cart(id):
    """this method return to the show method and use a form instance for display validater errors"""
    product = Product.get_by_id(id)
    form = AddCartForm(request.form, product=product)

    if form.validate_on_submit():
        Cart.add_to_currentuser_cart(form.quantity.data, form.variant.data)
    return redirect(url_for("product.show", id=id))


def variant_price(id):
    variant = ProductVariant.get_by_id(id)
    return jsonify({"price": float(variant.price), "stock": variant.stock})


def show_all_artists():
    # page = request.args.get("page", 1, type=int)
    ctx = Artist.get_all_artists()
    return render_template("artist/artists.html", **ctx)


def show_artist(id):
    page = request.args.get("page", 1, type=int)
    ctx = Artist.get_product_by_artist(id, page)
    return render_template("artist/index.html", **ctx)


def show_artist_by_title(title):
    page = request.args.get("page", 1, type=int)
    ctx = Artist.get_product_by_artist_title(title, page)
    return render_template("artist/index.html", **ctx)


def show_collection(id):
    page = request.args.get("page", 1, type=int)
    ctx = ProductCollection.get_product_by_collection(id, page)
    return render_template("artist/index.html", **ctx)


@impl
def flaskshop_load_blueprints(app):
    bp = Blueprint("product", __name__)
    bp.add_url_rule("/<int:id>", view_func=show)
    bp.add_url_rule("/<hyphen:product_title>",
                    view_func=show_product_by_full_title)

    bp.add_url_rule("/api/variant_price/<int:id>", view_func=variant_price)
    bp.add_url_rule("/<int:id>/add",
                    view_func=product_add_to_cart, methods=["POST"])
    bp.add_url_rule("/artist", view_func=show_all_artists)
    bp.add_url_rule("/artist/<int:id>", view_func=show_artist)
    bp.add_url_rule("/artist/<path:title>", view_func=show_artist_by_title)
    bp.add_url_rule("/collection/<int:id>", view_func=show_collection)

    app.register_blueprint(bp, url_prefix="/products")
