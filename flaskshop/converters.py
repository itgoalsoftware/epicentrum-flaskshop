from werkzeug.routing import BaseConverter


class HyphenConverter(BaseConverter):
    def to_python(self, value):
        return value.replace('-', ' ')

    def to_url(self, value):
        return value.replace(' ', '-')
