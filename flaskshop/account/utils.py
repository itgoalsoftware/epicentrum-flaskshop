"""User utils."""
import email.utils
import random
import smtplib
import string
from email.message import EmailMessage
from functools import wraps

import phonenumbers
from flask import abort, current_app, render_template
from flask_login import current_user
from phonenumbers.phonenumberutil import is_possible_number
from wtforms import ValidationError

from flaskshop.constant import Permission


class PhoneNumber(phonenumbers.PhoneNumber):
    """
    An extended version of phonenumbers.PhoneNumber that provides additional,
    more Pythonic, and easier-to-access methods. This makes using a PhoneNumber
    instance much easier, especially in templates and such.

    Attributes:
        format_map (dict): A mapping of format strings to phonenumbers.PhoneNumberFormat values.
    """

    format_map = {
        "E164": phonenumbers.PhoneNumberFormat.E164,
        "INTERNATIONAL": phonenumbers.PhoneNumberFormat.INTERNATIONAL,
        "NATIONAL": phonenumbers.PhoneNumberFormat.NATIONAL,
        "RFC3966": phonenumbers.PhoneNumberFormat.RFC3966,
    }

    @classmethod
    def from_string(cls, phone_number, region=None):
        """
        Create a PhoneNumber instance from a string.

        Args:
            phone_number (str): The phone number in string format.
            region (str, optional): The region code (e.g., 'US'). Defaults to None.

        Returns:
            PhoneNumber: The parsed PhoneNumber instance.
        """
        phone_number_obj = cls()
        if region is None:
            region = None
        phonenumbers.parse(
            number=phone_number,
            region=region,
            keep_raw_input=True,
            numobj=phone_number_obj,
        )
        return phone_number_obj

    def __unicode__(self):
        """
        Return the phone number formatted as E164.

        Returns:
            str: The phone number in E164 format.
        """
        format_string = "E164"
        fmt = self.format_map[format_string]
        return self.format_as(fmt)

    def is_valid(self):
        """
        Check whether the phone number is valid.

        Returns:
            bool: True if the phone number is valid, False otherwise.
        """
        return phonenumbers.is_valid_number(self)

    def format_as(self, phone_number_format):
        """
        Format the phone number in the specified format.

        Args:
            number_format (phonenumbers.PhoneNumberFormat): The format to use.

            Returns:
                str: The formatted phone number.
        """
        return phonenumbers.format_number(self, phone_number_format)

    @property
    def as_international(self):
        """
        Return the phone number formatted as an international number.

        Returns:
            str: The phone number in international format.
        """
        return self.format_as(phonenumbers.PhoneNumberFormat.INTERNATIONAL)

    @property
    def as_e164(self):
        """
        Return the phone number formatted as an E164 number.

        Returns:
            str: The phone number in E164 format.
        """
        return self.format_as(phonenumbers.PhoneNumberFormat.E164)

    @property
    def as_national(self):
        """
        Return the phone number formatted as a national number.

        Returns:
            str: The phone number in national format.
        """
        return self.format_as(phonenumbers.PhoneNumberFormat.NATIONAL)

    @property
    def as_rfc3966(self):
        """
        Return the phone number formatted as an RFC3966 number.

        Returns:
            str: The phone number in RFC3966 format.
        """
        return self.format_as(phonenumbers.PhoneNumberFormat.RFC3966)

    def __len__(self):
        """
        Return the length of the phone number string.

        Returns:
            int: The length of the phone number in E164 format.
        """
        return len(self.__unicode__())

    def __eq__(self, other):
        """
        Override parent equality to compare phone numbers based on their string representation.

        Args:
            other (PhoneNumber, phonenumbers.PhoneNumber, str): The other phone number to compare.

        Returns:
            bool: True if the phone numbers are equal, False otherwise.
        """
        if (
            isinstance(other, PhoneNumber)
            or isinstance(other, phonenumbers.PhoneNumber)
            or isinstance(other, str)
        ):
            format_string = "E164"
            default_region = None
            fmt = self.format_map[format_string]
            if isinstance(other, str):
                # Convert string to phonenumbers.PhoneNumber instance
                try:
                    other = phonenumbers.parse(other, region=default_region)
                except phonenumbers.NumberParseException:
                    # Conversion is not possible, thus not equal
                    return False
            other_string = phonenumbers.format_number(other, fmt)
            return self.format_as(fmt) == other_string
        else:
            return False

    def __hash__(self):
        """
        Return the hash of the phone number string.

        Returns:
            int: The hash of the phone number in E164 format.
        """
        return hash(self.__unicode__())


def to_python(value):
    """
    Convert a value to a PhoneNumber instance.

    Args:
        value (str or phonenumbers.PhoneNumber or PhoneNumber or None): The value to convert.

    Returns:
        PhoneNumber: The converted PhoneNumber instance or None if invalid.
    """
    if value in (None, ""):  # None or ''
        phone_number = value
    elif value and isinstance(value, str):
        try:
            phone_number = PhoneNumber.from_string(phone_number=value)
        except phonenumbers.NumberParseException:
            # the string provided is not a valid PhoneNumber.
            phone_number = PhoneNumber(raw_input=value)
    elif isinstance(value, phonenumbers.PhoneNumber) and not isinstance(
        value, PhoneNumber
    ):
        phone_number = PhoneNumber()
        phone_number.merge_from(value)
    elif isinstance(value, PhoneNumber):
        phone_number = value
    else:
        # TODO: this should somehow show that it has invalid data, but not
        #       completely die for bad data in the database.
        #       (Same for the NumberParseException above)
        phone_number = None
    return phone_number


def validate_possible_number(value):
    """
    Validate if the given value is a possible phone number.

    Args:
        value (str or PhoneNumber): The value to validate.

    Raises:
        ValidationError: If the phone number is not possible.
    """
    phone_number = to_python(value)
    if phone_number and not is_possible_number(phone_number):
        raise ValidationError("The phone number entered is not valid.")


def permission_required(permission):
    """
    Decorator to check if the current user has the required permission.

    Args:
        permission (Permission): The required permission.

    Returns:
        function: The decorated function.
    """
    def decorator(f):
        @wraps(f)
        def _deco(*args, **kwargs):
            if current_user.is_authenticated and current_user.can(permission):
                return f(*args, **kwargs)
            abort(403)

        return _deco

    return decorator


def admin_required(f):
    """
    Decorator to check if the current user has admin permission.

    Args:
        f (function): The function to decorate.

    Returns:
        function: The decorated function.
    """
    return permission_required(Permission.ADMINISTER)(f)


def gen_tmp_pwd(size=8, chars=string.ascii_uppercase + string.digits):
    """
    Generate a temporary password.

    Args:
        size (int, optional): The length of the password. Defaults to 8.
        chars (str, optional): The characters to use for the password. 
        Defaults to uppercase letters and digits.

    Returns:
        str: The generated password.
    """
    return "".join(random.choice(chars) for _ in range(size))


def create_email_server():
    """
    Create an email server connection.

    Returns:
        smtplib.SMTP or smtplib.SMTP_SSL: The email server connection.
    """
    servername = current_app.config.get("MAIL_SERVER")
    serverport = current_app.config.get("MAIL_PORT")
    use_tls = current_app.config.get("MAIL_TLS")

    if use_tls:
        server = smtplib.SMTP_SSL(servername, serverport)
    else:
        server = smtplib.SMTP(servername, serverport)
    return server


def send_reset_pwd_email(to_email, new_passwd):
    """
    Send a password reset email.

    Args:
        to_email (str): The recipient's email address.
        new_passwd (str): The new password to include in the email.
    """
    mailuser = current_app.config.get("MAIL_USERNAME")
    mailpwd = current_app.config.get("MAIL_PASSWORD")

    msg = EmailMessage()
    msg["To"] = email.utils.formataddr(("Recipient", to_email))
    msg["From"] = email.utils.formataddr(("Admin", mailuser))
    msg["Subject"] = "Reset Password"
    body = render_template(
        "account/reset_passwd_mail.html", new_passwd=new_passwd)
    msg.set_content(body, "html")

    with create_email_server() as s:
        s.login(mailuser, mailpwd)
        s.send_message(msg)
