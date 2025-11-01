
def generate_groupCode(length=6):
    """Genera un código único para StudentGroup con el formato 'xxx-xxx'."""
    from apps.courses.api.models import StudentGroup
    import random
    import string

    def generate_random_string(length):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

    part1 = generate_random_string(3)
    part2 = generate_random_string(3)
    code = f"{part1}-{part2}"

    while StudentGroup.objects.filter(groupCode=code).exists():
        part1 = generate_random_string(3)
        part2 = generate_random_string(3)
        code = f"{part1}-{part2}"
        
    return code
