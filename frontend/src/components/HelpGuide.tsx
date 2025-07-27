import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Code, 
  Database, 
  Lock, 
  Eye, 
  Zap,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface VulnerabilityType {
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  examples: string[];
  prevention: string[];
  icon: React.ComponentType<any>;
  color: string;
}

const vulnerabilityTypes: VulnerabilityType[] = [
  {
    name: 'SQL Injection',
    description: 'A code injection technique that exploits vulnerabilities in database queries by inserting malicious SQL code.',
    severity: 'critical',
    examples: [
      'query = "SELECT * FROM users WHERE id = " + user_input',
      'cursor.execute("SELECT * FROM users WHERE name = \'" + name + "\'")',
      'db.query("SELECT * FROM users WHERE email = " + email)'
    ],
    prevention: [
      'Use parameterized queries or prepared statements',
      'Validate and sanitize all user inputs',
      'Use ORM libraries that handle SQL escaping',
      'Implement input validation and whitelisting'
    ],
    icon: Database,
    color: 'text-red-600'
  },
  {
    name: 'Cross-Site Scripting (XSS)',
    description: 'A security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users.',
    severity: 'high',
    examples: [
      'element.innerHTML = userInput',
      'document.write(userData)',
      'eval(userProvidedCode)',
      'React dangerouslySetInnerHTML={{ __html: userInput }}'
    ],
    prevention: [
      'Use textContent instead of innerHTML',
      'Escape all user inputs before rendering',
      'Implement Content Security Policy (CSP)',
      'Validate and sanitize all user inputs'
    ],
    icon: Eye,
    color: 'text-orange-600'
  },
  {
    name: 'Code Execution',
    description: 'Dangerous code execution functions that can execute arbitrary code, often leading to remote code execution.',
    severity: 'critical',
    examples: [
      'eval(userInput)',
      'exec(userCode)',
      'Function(userCode)()',
      'setTimeout(userCode, 1000)'
    ],
    prevention: [
      'Avoid eval(), exec(), and similar functions',
      'Use safer alternatives like JSON.parse()',
      'Implement strict input validation',
      'Use sandboxed environments when possible'
    ],
    icon: Zap,
    color: 'text-red-700'
  },
  {
    name: 'Hardcoded Secrets',
    description: 'Sensitive information like passwords, API keys, or tokens hardcoded directly in source code.',
    severity: 'high',
    examples: [
      'password = "secret123"',
      'api_key = "sk-1234567890abcdef"',
      'const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"',
      'database_url = "postgresql://user:pass@localhost/db"'
    ],
    prevention: [
      'Use environment variables for secrets',
      'Implement secure secret management',
      'Use configuration files outside of source control',
      'Rotate secrets regularly'
    ],
    icon: Lock,
    color: 'text-yellow-600'
  },
  {
    name: 'Buffer Overflow',
    description: 'A memory safety issue where a program writes data beyond the allocated buffer, potentially overwriting adjacent memory.',
    severity: 'critical',
    examples: [
      'gets(buffer)',
      'strcpy(dest, src)',
      'sprintf(buffer, format, ...)',
      'memcpy(dest, src, size)'
    ],
    prevention: [
      'Use bounds-checking functions',
      'Validate input sizes before copying',
      'Use safer alternatives like strncpy()',
      'Implement proper memory management'
    ],
    icon: AlertTriangle,
    color: 'text-red-800'
  },
  {
    name: 'Command Injection',
    description: 'A vulnerability that allows execution of arbitrary system commands through user input.',
    severity: 'critical',
    examples: [
      'os.system(userInput)',
      'subprocess.call(userCommand)',
      'exec(userCommand)',
      'child_process.exec(userInput)'
    ],
    prevention: [
      'Avoid shell command execution',
      'Use parameterized APIs instead',
      'Validate and sanitize all inputs',
      'Implement proper input validation'
    ],
    icon: Code,
    color: 'text-red-600'
  }
];

const HelpGuide: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (name: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedSections(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-textPrimary">Security Vulnerability Guide</h1>
        </div>
        <p className="text-textSecondary max-w-2xl mx-auto">
          Learn about common security vulnerabilities, their risks, and how to prevent them. 
          This guide helps you understand what ScanSec detects and how to fix issues in your code.
        </p>
      </div>

      {/* Vulnerability Types */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">Common Vulnerability Types</h2>
        
        {vulnerabilityTypes.map((vuln) => {
          const Icon = vuln.icon;
          const isExpanded = expandedSections.has(vuln.name);
          
          return (
            <div key={vuln.name} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleSection(vuln.name)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-6 h-6 ${vuln.color}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-textPrimary">{vuln.name}</h3>
                    <p className="text-sm text-textSecondary mt-1">{vuln.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity.toUpperCase()}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Examples */}
                    <div>
                      <h4 className="font-medium text-textPrimary mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Vulnerable Examples
                      </h4>
                      <div className="space-y-2">
                        {vuln.examples.map((example, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                            <code className="text-sm text-red-800 font-mono">{example}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Prevention */}
                    <div>
                      <h4 className="font-medium text-textPrimary mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Prevention Strategies
                      </h4>
                      <ul className="space-y-2">
                        {vuln.prevention.map((strategy, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-gray-700">{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Best Practices */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          General Security Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Input Validation</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Always validate and sanitize user inputs</li>
              <li>• Use whitelisting instead of blacklisting</li>
              <li>• Implement proper type checking</li>
              <li>• Set reasonable input length limits</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Secure Development</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Follow the principle of least privilege</li>
              <li>• Keep dependencies updated</li>
              <li>• Use HTTPS for all communications</li>
              <li>• Implement proper error handling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-textPrimary mb-2">OWASP Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://owasp.org/www-project-top-ten/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  OWASP Top 10 <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  XSS Prevention Cheat Sheet <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  SQL Injection Prevention <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-textPrimary mb-2">Security Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>• SonarQube - Code quality and security</li>
              <li>• Bandit - Python security linter</li>
              <li>• ESLint security plugin - JavaScript security</li>
              <li>• Snyk - Dependency vulnerability scanning</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-200">
        <p className="text-sm text-textSecondary">
          This guide is designed to help you understand and prevent common security vulnerabilities. 
          Always follow your organization's security policies and consult with security experts when needed.
        </p>
      </div>
    </div>
  );
};

export default HelpGuide; 