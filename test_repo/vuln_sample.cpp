// C++ sample with vulnerabilities
#include <cstdlib>
void dangerous() {
    system("ls"); // Insecure: system
    exec("ls");   // Insecure: exec
} 