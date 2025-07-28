import React from 'react';
import { X, Code, Lightbulb, Copy, CheckCircle } from 'lucide-react';

interface VulnerabilityData {
  type: string;
  severity: string;
  file_path: string;
  line_number: number;
  code_snippet: string;
  description: string;
  language: string;
}

interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vulnerability: VulnerabilityData;
}

// Language-specific recommendations and examples
const languageRecommendations: Record<string, any> = {
  python: {
    sql_injection: {
      title: "SQL Injection Fix",
      description: "Use parameterized queries to prevent SQL injection",
      bad_example: "query = f\"SELECT * FROM users WHERE id = {user_input}\"",
      good_example: "query = \"SELECT * FROM users WHERE id = %s\"\ncursor.execute(query, (user_input,))",
      best_practices: [
        "Always use parameterized queries",
        "Never concatenate user input directly into SQL",
        "Use ORM libraries like SQLAlchemy when possible"
      ]
    },
    eval_exec: {
      title: "Dangerous eval() Usage",
      description: "Avoid using eval() with user input",
      bad_example: "result = eval(user_input)",
      good_example: "# Use specific parsing functions instead\nimport ast\nresult = ast.literal_eval(user_input)",
      best_practices: [
        "Never use eval() with user input",
        "Use ast.literal_eval() for safe evaluation",
        "Consider using json.loads() for JSON data"
      ]
    },
    hardcoded_secret: {
      title: "Hardcoded Secret",
      description: "Move secrets to environment variables",
      bad_example: "API_KEY = \"sk-1234567890abcdef\"",
      good_example: "import os\nAPI_KEY = os.getenv('API_KEY')",
      best_practices: [
        "Use environment variables for secrets",
        "Never commit secrets to version control",
        "Use .env files for local development"
      ]
    }
  },
  javascript: {
    xss: {
      title: "XSS Prevention",
      description: "Escape user input to prevent XSS attacks",
      bad_example: "element.innerHTML = userInput",
      good_example: "element.textContent = userInput\n// or use DOMPurify\nconst clean = DOMPurify.sanitize(userInput)",
      best_practices: [
        "Use textContent instead of innerHTML",
        "Sanitize user input with libraries like DOMPurify",
        "Set Content-Security-Policy headers"
      ]
    },
    eval_exec: {
      title: "Dangerous eval() Usage",
      description: "Avoid using eval() with user input",
      bad_example: "const result = eval(userInput)",
      good_example: "// Use JSON.parse for JSON data\nconst result = JSON.parse(userInput)",
      best_practices: [
        "Never use eval() with user input",
        "Use JSON.parse() for JSON data",
        "Consider using Function constructor for specific cases"
      ]
    }
  },
  cpp: {
    buffer_overflow: {
      title: "Buffer Overflow Prevention",
      description: "Use safe string functions and bounds checking",
      bad_example: "char dest[10];\nstrcpy(dest, src);",
      good_example: "char dest[10];\nstrncpy(dest, src, sizeof(dest) - 1);\ndest[sizeof(dest) - 1] = '\\0';",
      best_practices: [
        "Use strncpy instead of strcpy",
        "Always check buffer bounds",
        "Use std::string when possible"
      ]
    },
    memory_leak: {
      title: "Memory Leak Prevention",
      description: "Use RAII and smart pointers",
      bad_example: "int* ptr = new int[100];\n// Missing delete[]",
      good_example: "#include <memory>\nstd::unique_ptr<int[]> ptr = std::make_unique<int[]>(100);",
      best_practices: [
        "Use smart pointers (unique_ptr, shared_ptr)",
        "Follow RAII principles",
        "Use containers like std::vector"
      ]
    }
  }
};

const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({ isOpen, onClose, vulnerability }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  // Get language-specific recommendations
  const language = vulnerability.language.toLowerCase();
  const vulnType = vulnerability.type.toLowerCase().replace(/\s+/g, '_');
  const recommendations = languageRecommendations[language]?.[vulnType] || languageRecommendations[language]?.sql_injection || {
    title: "Security Fix",
    description: "General security recommendation",
    bad_example: vulnerability.code_snippet,
    good_example: "// Implement proper security measures here",
    best_practices: [
      "Validate all user input",
      "Use secure coding practices",
      "Follow language-specific security guidelines"
    ]
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">{recommendations.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Vulnerability Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">File:</span> {vulnerability.file_path}:{vulnerability.line_number}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Description:</span> {vulnerability.description}
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              Recommendation
            </h3>
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              {recommendations.description}
            </p>
          </div>

          {/* Code Examples */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4 text-red-600" />
                Vulnerable Code
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <pre className="text-sm text-red-800 font-mono overflow-x-auto">
                  <code>{recommendations.bad_example}</code>
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Secure Code
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <pre className="text-sm text-green-800 font-mono overflow-x-auto">
                  <code>{recommendations.good_example}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(recommendations.good_example)}
                  className="mt-2 flex items-center gap-1 text-xs text-green-700 hover:text-green-800"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy code'}
                </button>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
            <ul className="space-y-1">
              {recommendations.best_practices.map((practice, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  {practice}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationModal; 