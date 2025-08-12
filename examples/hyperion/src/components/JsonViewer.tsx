import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: any;
  name?: string;
  maxInitialDepth?: number;
  compact?: boolean;
}

interface JsonNodeProps {
  data: any;
  keyName?: string;
  depth: number;
  maxDepth: number;
}

const JsonNode = ({ data, keyName, depth, maxDepth }: JsonNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(depth < maxDepth);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (value: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const formatPrimitive = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-600';
      case 'number': return 'text-blue-600';
      case 'boolean': return 'text-purple-600';
      case 'null': return 'text-gray-500';
      case 'array': return 'text-orange-600';
      case 'object': return 'text-red-600';
      default: return 'text-gray-800';
    }
  };

  const valueType = getValueType(data);

  if (valueType === 'object' && data !== null) {
    const keys = Object.keys(data);
    const isEmpty = keys.length === 0;

    return (
      <div>
        <div className="flex items-center gap-1 group">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? 
              <ChevronDown className="w-3 h-3" /> : 
              <ChevronRight className="w-3 h-3" />
            }
            {keyName && <span className="font-medium text-gray-700">{keyName}: </span>}
            <span className="text-gray-600">
              {isEmpty ? '{}' : `{${keys.length} ${keys.length === 1 ? 'key' : 'keys'}}`}
            </span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(data)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6"
          >
            {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
        {isExpanded && !isEmpty && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {keys.map((key) => (
              <JsonNode
                key={key}
                data={data[key]}
                keyName={key}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (valueType === 'array') {
    const isEmpty = data.length === 0;

    return (
      <div>
        <div className="flex items-center gap-1 group">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? 
              <ChevronDown className="w-3 h-3" /> : 
              <ChevronRight className="w-3 h-3" />
            }
            {keyName && <span className="font-medium text-gray-700">{keyName}: </span>}
            <span className="text-orange-600">
              {isEmpty ? '[]' : `[${data.length} ${data.length === 1 ? 'item' : 'items'}]`}
            </span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(data)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6"
          >
            {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
        {isExpanded && !isEmpty && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {data.map((item: any, index: number) => (
              <JsonNode
                key={index}
                data={item}
                keyName={`[${index}]`}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <div>
        {keyName && <span className="font-medium text-gray-700">{keyName}: </span>}
        <span className={getTypeColor(valueType)}>
          {formatPrimitive(data)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(data)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6"
      >
        {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </Button>
    </div>
  );
};

export const JsonViewer = ({ 
  data, 
  name = "root", 
  maxInitialDepth = 2,
  compact = false 
}: JsonViewerProps) => {
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-sm font-mono max-h-32 overflow-auto">
        <JsonNode 
          data={data} 
          depth={0} 
          maxDepth={1}
        />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'tree' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'raw' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
            }`}
          >
            Raw JSON
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyAll}
          className="flex items-center gap-1"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy All'}
        </Button>
      </div>
      
      <div className="p-4 max-h-96 overflow-auto">
        {viewMode === 'tree' ? (
          <JsonNode 
            data={data} 
            keyName={name}
            depth={0} 
            maxDepth={maxInitialDepth}
          />
        ) : (
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};