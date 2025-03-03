def char_to_ascii(input_string):
    ascii_values = [ord(char) for char in input_string]
    return ascii_values
input_string = "Hello"
ascii_values = char_to_ascii(input_string)
print(f"The ASCII values for '{input_string}' are: {ascii_values}")
