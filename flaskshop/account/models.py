"""User models."""
from functools import reduce
from operator import or_

from flask_login import UserMixin
from libgravatar import Gravatar
from sqlalchemy.ext.hybrid import hybrid_property

from flaskshop.constant import Permission
from flaskshop.database import Column, Model, db
from flaskshop.extensions import bcrypt


class User(Model, UserMixin):
    """
    User model representing a user account.

    Attributes:
        __tablename__ (str): Name of the table in the database.
        username (Column): The user's username, unique and non-nullable.
        email (Column): The user's email address, unique and non-nullable.
        _password (Column): The hashed password, non-nullable.
        nick_name (Column): The user's nickname.
        is_active (Column): Boolean indicating if the user is active.
        open_id (Column): Open ID for the user, indexed.
        session_key (Column): Session key for the user, indexed.
    """

    __tablename__ = "account_user"
    username = Column(db.String(80), unique=True,
                      nullable=False, comment="user`s name")
    email = Column(db.String(80), unique=True, nullable=False)
    #: The hashed password
    _password = db.Column(db.String(255), nullable=False)
    nick_name = Column(db.String(255))
    is_active = Column(db.Boolean(), default=False)
    open_id = Column(db.String(80), index=True)
    session_key = Column(db.String(80), index=True)

    def __init__(self, username, email, password, **kwargs):
        """
        Initialize the User instance.

        Args:
            username (str): The username of the user.
            email (str): The email address of the user.
            password (str): The password for the user.
            **kwargs: Additional keyword arguments.
        """
        super().__init__(username=username, email=email, password=password, **kwargs)

    def __str__(self):
        """Return the string representation of the user."""
        return self.username

    @hybrid_property
    def password(self):
        """Get the hashed password."""
        return self._password

    @password.setter
    def password(self, value):
        """Set the hashed password."""
        self._password = bcrypt.generate_password_hash(value).decode("UTF-8")

    @property
    def avatar(self):
        """Return the user's avatar URL based on their email."""
        return Gravatar(self.email).get_image()

    def check_password(self, value):
        """
        Check if the provided password matches the stored hashed password.

        Args:
            value (str): The password to check.

        Returns:
            bool: True if the password matches, False otherwise.
        """
        return bcrypt.check_password_hash(self.password.encode("utf-8"), value)

    @property
    def addresses(self):
        """Return a list of addresses associated with the user."""
        return UserAddress.query.filter_by(user_id=self.id).all()

    @property
    def is_active_human(self):
        """Return 'Y' if the user is active, 'N' otherwise."""
        return "Y" if self.is_active else "N"

    @property
    def roles(self):
        """Return a list of roles assigned to the user."""
        at_ids = (
            UserRole.query.with_entities(UserRole.role_id)
            .filter_by(user_id=self.id)
            .all()
        )
        return Role.query.filter(Role.id.in_(id for id, in at_ids)).all()

    def delete(self):
        """Delete the user and their associated addresses."""
        for addr in self.addresses:
            addr.delete()
        return super().delete()

    def can(self, permissions):
        """
        Check if the user has the specified permissions.

        Args:
            permissions (int): The permissions to check.

        Returns:
            bool: True if the user has the permissions, False otherwise.
        """
        if not self.roles:
            return False
        all_perms = reduce(or_, map(lambda x: x.permissions, self.roles))
        return all_perms >= permissions

    def can_admin(self):
        """
        Check if the user has admin permissions.

        Returns:
            bool: True if the user has admin permissions, False otherwise.
        """
        return self.can(Permission.ADMINISTER)

    def can_edit(self):
        """
        Check if the user has editor permissions.

        Returns:
            bool: True if the user has editor permissions, False otherwise.
        """
        return self.can(Permission.EDITOR)

    def can_op(self):
        """
        Check if the user has operator permissions.

        Returns:
            bool: True if the user has operator permissions, False otherwise.
        """
        return self.can(Permission.OPERATOR)


class UserAddress(Model):
    """
    Model representing a user's address.

    Attributes:
        __tablename__ (str): Name of the table in the database.
        user_id (Column): ID of the user associated with the address.
        province (Column): The province of the address.
        city (Column): The city of the address.
        district (Column): The district of the address.
        address (Column): The detailed address.
        contact_name (Column): The contact name for the address.
        contact_phone (Column): The contact phone number for the address.
    """

    __tablename__ = "account_address"
    user_id = Column(db.Integer())
    province = Column(db.String(255))
    city = Column(db.String(255))
    district = Column(db.String(255))
    address = Column(db.String(255))
    contact_name = Column(db.String(255))
    contact_phone = Column(db.String(80))

    @property
    def full_address(self):
        """
        Return the full address as a formatted string.

        Returns:
            str: The full address.
        """
        return (
            f"{self.province}<br>{self.city}<br>{self.district}<br>"
            f"{self.address}<br>{self.contact_name}<br>{self.contact_phone}"
        )

    @hybrid_property
    def user(self):
        """
        Return the user associated with the address.

        Returns:
            User: The user associated with the address.
        """
        return User.get_by_id(self.user_id)

    def __str__(self):
        """Return the string representation of the full address."""
        return self.full_address


class Role(Model):
    """
    Model representing a role in the system.

    Attributes:
        __tablename__ (str): Name of the table in the database.
        name (Column): The name of the role, unique.
        permissions (Column): The permissions associated with the role.
    """

    __tablename__ = "account_role"
    name = Column(db.String(80), unique=True)
    permissions = Column(db.Integer(), default=Permission.LOGIN)


class UserRole(Model):
    """
    Model representing the association between a user and a role.

    Attributes:
        __tablename__ (str): Name of the table in the database.
        user_id (Column): ID of the user.
        role_id (Column): ID of the role.
    """

    __tablename__ = "account_user_role"
    user_id = Column(db.Integer())
    role_id = Column(db.Integer())
