from flask_wtf import FlaskForm
from wtforms import IntegerField, RadioField
from wtforms.validators import DataRequired, NumberRange
from wtforms.widgets.core import Input


class NumberInput(Input):
    input_type = "number"


class MyIntegerField(IntegerField):
    widget = NumberInput()


class AddCartForm(FlaskForm):
    variant = RadioField("variant", validators=[DataRequired()], coerce=int)
    child_variant = RadioField("child_variant", validators=[
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
