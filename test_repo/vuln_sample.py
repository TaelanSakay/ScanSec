# Python sample with vulnerabilities
def dangerous_eval(user_input):
    return eval(user_input)  # Insecure: eval

def dangerous_exec(cmd):
    exec(cmd)  # Insecure: exec 