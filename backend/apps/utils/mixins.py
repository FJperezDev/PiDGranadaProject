
# Utility mixin for language-aware fields
class LanguageSerializerMixin:
    def get_lang(self):
        request = self.context.get('request')
        if request:
            lang = request.headers.get('Accept-Language', 'es')[:2]
            return 'en' if lang == 'en' else 'es'
        return 'es'