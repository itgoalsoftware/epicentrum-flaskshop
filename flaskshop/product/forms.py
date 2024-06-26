from flask_wtf import FlaskForm
from wtforms import IntegerField, RadioField
from wtforms.validators import DataRequired, NumberRange
from wtforms.widgets.core import Input


class NumberInput(Input):
    input_type = "number"


class MyIntegerField(IntegerField):
    widget = NumberInput()


class AddCartForm(FlaskForm):
    variant = RadioField("Variant", validators=[DataRequired()], coerce=int)
    child_variant = RadioField("Frame type", validators=[
                               DataRequired()], coerce=int)
    last_child_variant = RadioField("Passe-partout colour", validators=[
        DataRequired()], coerce=int)
    quantity = MyIntegerField(
        "quantity", validators=[DataRequired(), NumberRange(min=1)], default=1
    )

    def __init__(self, *args, product=None, **kwargs):
        super().__init__(*args, **kwargs)
        if product:
            self.variant.choices = [(vari.id, vari)
                                    for vari in product.variant_first_level]
            self.child_variant.choices = [
                (child.id, child.title) for child in product.variant_children]

            self.last_child_variant.choices = [
                (child.id, child.title) for child in product.all_last_children]
