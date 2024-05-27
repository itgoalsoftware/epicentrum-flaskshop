# -*- coding: utf-8 -*-
"""User views."""
from flask import Blueprint, flash, redirect, render_template, request, url_for
from flask_babel import lazy_gettext
from flask_login import current_user, login_required, login_user, logout_user
from pluggy import HookimplMarker

from flaskshop.order.models import Order
from flaskshop.utils import flash_errors

from .forms import AddressForm, ChangePasswordForm, LoginForm, RegisterForm, ResetPasswd
from .models import User, UserAddress
from .utils import gen_tmp_pwd, send_reset_pwd_email

impl = HookimplMarker("flaskshop")


def index():
    """
    Render the user's account details page with the form to change the password.
    Lists the current user's orders.

    Returns:
        A rendered template of the user's account details page.
    """
    form = ChangePasswordForm(request.form)
    orders = Order.get_current_user_orders()
    return render_template("account/details.html", form=form, orders=orders)


def login():
    """
    Render the login page and handle the login process.

    This view renders the login page and processes the login form submission.
    If the form is validated, the user is logged in and 
    redirected to the next URL or the home page. 
    A success message is flashed upon successful login.

    Returns:
        A rendered template for the login page or a redirect to the next URL/home page.
    """
    form = LoginForm(request.form)
    if form.validate_on_submit():
        login_user(form.user)
        redirect_url = request.args.get("next") or url_for("public.home")
        flash(lazy_gettext("You are log in."), "success")
        return redirect(redirect_url)
    else:
        flash_errors(form)
    return render_template("account/login.html", form=form)


def resetpwd():
    """
    Reset the user's password.

    This view handles the password reset process. 
    If the form is validated, a new temporary password is generated,
    sent to the user's email, and the user's password is updated. 
    A success message is flashed upon successful reset, 
    and the user is redirected to the login page.

    Returns:
        A rendered template for the login page with a reset flag or a redirect to the login page.
    """
    form = ResetPasswd(request.form)

    if form.validate_on_submit():
        flash(lazy_gettext("Check your e-mail."), "success")
        new_passwd = gen_tmp_pwd()
        send_reset_pwd_email(form.username.data, new_passwd)
        form.user.update(password=new_passwd)
        return redirect(url_for("account.login"))
    else:
        flash_errors(form)
    return render_template("account/login.html", form=form, reset=True)


@login_required
def logout():
    """
    Log out the current user.

    This view logs out the current user, 
    flashes an informational message, 
    and redirects to the home page.

    Returns:
        A redirect to the home page.
    """
    logout_user()
    flash(lazy_gettext("You are logged out."), "info")
    return redirect(url_for("public.home"))


def signup():
    """
    Register a new user.

    This view renders the signup page and handles the registration form submission. 
    If the form is validated,
    a new user is created and logged in.
    A success message is flashed upon successful registration.

    Returns:
        A rendered template for the signup page or a redirect to the home page.
    """
    form = RegisterForm(request.form)
    if form.validate_on_submit():
        user = User.create(
            username=form.username.data,
            email=form.email.data.lower(),
            password=form.password.data,
            is_active=True,
        )
        login_user(user)
        flash(lazy_gettext("You are signed up."), "success")
        return redirect(url_for("public.home"))
    else:
        flash_errors(form)
    return render_template("account/signup.html", form=form)


def set_password():
    """
    Set a new password for the current user.

    This view handles the password change process. If the form is submitted and validated,
    the user's password is updated. A success message is flashed upon successful update.

    Returns:
        A redirect to the account index page.
    """
    form = ChangePasswordForm(request.form)
    if form.validate_on_submit():
        current_user.update(password=form.password.data)
        flash(lazy_gettext("You have changed password."), "success")
    else:
        flash_errors(form)
    return redirect(url_for("account.index"))


def addresses():
    """
    List the current user's addresses.

    This view renders a template displaying the list of addresses associated with the current user.

    Returns:
        A rendered template for the addresses page.
    """
    user_addresses = current_user.addresses
    return render_template("account/addresses.html", addresses=user_addresses)


def edit_address():
    """
    Create or edit a user address.

    This view handles both the creation of a new address and the editing of an existing address.
    If an address ID is provided, 
    the existing address is loaded and the form is populated with its data.
    If the form is submitted and validated, the address is either updated or 
    created based on whether an address ID was provided.

    Returns:
        A rendered template for the address edit page or
        a redirect to the account index page with a success message.
    """
    form = AddressForm(request.form)
    address_id = request.args.get("id", None, type=int)
    if address_id:
        user_address = UserAddress.get_by_id(address_id)
        form = AddressForm(request.form, obj=user_address)
    if request.method == "POST" and form.validate_on_submit():
        address_data = {
            "province": form.province.data,
            "city": form.city.data,
            "district": form.district.data,
            "address": form.address.data,
            "contact_name": form.contact_name.data,
            "contact_phone": form.contact_phone.data,
            "user_id": current_user.id,
        }
        if address_id:
            UserAddress.update(user_address, **address_data)
            flash(lazy_gettext("Success edit address."), "success")
        else:
            UserAddress.create(**address_data)
            flash(lazy_gettext("Success add address."), "success")
        return redirect(url_for("account.index") + "#addresses")
    else:
        flash_errors(form)
    return render_template(
        "account/address_edit.html", form=form, address_id=address_id)


def delete_address(address_id):
    """
    Delete a user address.

    This view handles the deletion of a user address. If the address belongs to the current user,
    it is deleted.

    Args:
        address_id (int): The ID of the address to be deleted.

    Returns:
        A redirect to the account index page.
    """
    user_address = UserAddress.get_by_id(address_id)
    if user_address in current_user.addresses:
        UserAddress.delete(user_address)
    return redirect(url_for("account.index") + "#addresses")


@impl
def flaskshop_load_blueprints(app):
    """
    Loads the blueprints for the account-related views.
    Registers them with the Flask application.

    Args:
        app (Flask): The Flask application instance.
    """
    bp = Blueprint("account", __name__)
    bp.add_url_rule("/", view_func=index)
    bp.add_url_rule("/login", view_func=login, methods=["GET", "POST"])
    bp.add_url_rule("/resetpwd", view_func=resetpwd, methods=["GET", "POST"])
    bp.add_url_rule("/logout", view_func=logout)
    bp.add_url_rule("/signup", view_func=signup, methods=["GET", "POST"])
    bp.add_url_rule("/setpwd", view_func=set_password, methods=["POST"])
    bp.add_url_rule("/address", view_func=addresses)
    bp.add_url_rule("/address/edit", view_func=edit_address,
                    methods=["GET", "POST"])
    bp.add_url_rule("/address/<int:id>/delete",
                    view_func=delete_address, methods=["POST"])
    app.register_blueprint(bp, url_prefix="/account")
