import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Database, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  TrendingUp,
  X,
  Eye,
  Settings
} from 'lucide-react';

interface ImportedData {
  id: string;
  filename: string;
  format: 'csv' | 'json' | 'excel';
  size: number;
  uploadDate: Date;
  recordCount: number;
  columns: string[];
  preview: any[];
  processed: boolean;
  validated: boolean;
  errors: string[];
}

// interface DataColumn {
//   name: string;
//   type: 'number' | 'string' | 'date' | 'boolean';
//   mapped: boolean;
//   mappedTo?: string;
//   sampleValues: any[];
// }

interface AnalysisResult {
  summary: {
    totalRecords: number;
    dateRange: { start: Date; end: Date };
    averageValues: Record<string, number>;
    trends: Record<string, 'increasing' | 'decreasing' | 'stable'>;
    anomalies: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  insights: string[];
  recommendations: string[];
  visualizations: any[];
}

interface DataImportAnalysisProps {
  onDataImported: (data: ImportedData) => void;
  onAnalysisComplete: (analysis: AnalysisResult) => void;
}

export const DataImportAnalysis: React.FC<DataImportAnalysisProps> = ({
  onDataImported,
  onAnalysisComplete
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'mapping' | 'analysis' | 'history'>('import');
  const [importedFiles, setImportedFiles] = useState<ImportedData[]>([]);
  const [selectedFile, setSelectedFile] = useState<ImportedData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const supportedFormats = {
    'text/csv': 'csv',
    'application/json': 'json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
    'application/vnd.ms-excel': 'excel'
  };

  const sensorParameters = [
    'timestamp', 'displacement', 'strain', 'porePressure', 
    'temperature', 'vibration', 'rainfall', 'windSpeed', 
    'soilMoisture', 'tiltAngle'
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => processFile(file));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => processFile(file));
  };

  const processFile = async (file: File) => {
    const format = supportedFormats[file.type as keyof typeof supportedFormats];
    if (!format) {
      alert('Unsupported file format. Please upload CSV, JSON, or Excel files.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file processing with progress
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress((event.loaded / event.total) * 100);
        }
      };

      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const processedData = await parseFileContent(content, format, file);
        
        const importedData: ImportedData = {
          id: Date.now().toString(),
          filename: file.name,
          format: format as any,
          size: file.size,
          uploadDate: new Date(),
          recordCount: processedData.length,
          columns: processedData.length > 0 ? Object.keys(processedData[0]) : [],
          preview: processedData.slice(0, 10), // First 10 records for preview
          processed: true,
          validated: false,
          errors: []
        };

        // Validate data structure
        const validation = validateData(importedData);
        importedData.validated = validation.isValid;
        importedData.errors = validation.errors;

        setImportedFiles(prev => [importedData, ...prev]);
        setSelectedFile(importedData);
        onDataImported(importedData);
        
        setIsUploading(false);
        setUploadProgress(0);
        setActiveTab('mapping');
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const parseFileContent = async (content: string, format: string, _file: File): Promise<any[]> => {
    switch (format) {
      case 'csv':
        return parseCSV(content);
      case 'json':
        return JSON.parse(content);
      case 'excel':
        // In a real implementation, you'd use a library like xlsx
        throw new Error('Excel parsing not implemented in this demo');
      default:
        throw new Error('Unsupported format');
    }
  };

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const record: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to parse as number, otherwise keep as string
        record[header] = isNaN(Number(value)) ? value : Number(value);
      });
      
      return record;
    });
  };

  const validateData = (data: ImportedData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (data.recordCount === 0) {
      errors.push('File contains no data records');
    }
    
    if (data.columns.length === 0) {
      errors.push('No columns detected in the data');
    }
    
    // Check for required columns
    const hasTimestamp = data.columns.some(col => 
      col.toLowerCase().includes('time') || 
      col.toLowerCase().includes('date')
    );
    
    if (!hasTimestamp) {
      errors.push('No timestamp column detected');
    }
    
    // Check for at least one sensor parameter
    const hasSensorData = data.columns.some(col =>
      sensorParameters.some(param => 
        col.toLowerCase().includes(param.toLowerCase())
      )
    );
    
    if (!hasSensorData) {
      errors.push('No recognized sensor parameters found');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const analyzeData = async (data: ImportedData) => {
    if (!data.validated) {
      alert('Please validate and map the data first');
      return;
    }

    // Simulate advanced data analysis
    const analysis: AnalysisResult = {
      summary: {
        totalRecords: data.recordCount,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        averageValues: {
          displacement: 5.2,
          strain: 150.8,
          porePressure: 245.6,
          vibration: 1.8
        },
        trends: {
          displacement: 'increasing',
          strain: 'stable',
          porePressure: 'increasing',
          vibration: 'decreasing'
        },
        anomalies: Math.floor(data.recordCount * 0.05), // 5% anomalies
        quality: data.recordCount > 1000 ? 'excellent' : 
                data.recordCount > 500 ? 'good' : 
                data.recordCount > 100 ? 'fair' : 'poor'
      },
      insights: [
        'Displacement values show an upward trend over the past week',
        'Pore pressure spikes correlate with rainfall events',
        'Vibration levels are within normal operational ranges',
        'Data quality is consistent with minimal gaps'
      ],
      recommendations: [
        'Monitor displacement trends closely as they approach warning thresholds',
        'Consider installing additional pore pressure sensors in high-risk areas',
        'Schedule equipment maintenance based on vibration analysis',
        'Implement real-time alerting for displacement values above 15mm'
      ],
      visualizations: [] // Would contain chart data in real implementation
    };

    setAnalysisResults(analysis);
    onAnalysisComplete(analysis);
    setActiveTab('analysis');
  };

  const ColumnMapper = ({ data }: { data: ImportedData }) => {
    const [mappings, setMappings] = useState<Record<string, string>>({});

    const handleMapping = (column: string, parameter: string) => {
      setMappings(prev => ({ ...prev, [column]: parameter }));
    };

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Map Data Columns</h4>
        <p className="text-sm text-gray-600">
          Map your data columns to standard sensor parameters for analysis
        </p>
        
        <div className="grid gap-4">
          {data.columns.map((column) => (
            <div key={column} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">{column}</p>
                <p className="text-sm text-gray-500">
                  Sample: {data.preview[0]?.[column]?.toString() || 'N/A'}
                </p>
              </div>
              <select
                value={mappings[column] || ''}
                onChange={(e) => handleMapping(column, e.target.value)}
                className="w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              >
                <option value="">Select parameter...</option>
                {sensorParameters.map(param => (
                  <option key={param} value={param}>{param}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => analyzeData(data)}
          className="w-full bg-navy-600 text-white py-3 px-4 rounded-lg hover:bg-navy-700 font-medium"
        >
          Start Analysis
        </motion.button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Data Import & Analysis</h3>
              <p className="text-navy-200 text-sm">Upload and analyze sensor data files</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'import', label: 'Import Data', icon: Upload },
            { id: 'mapping', label: 'Column Mapping', icon: Settings },
            { id: 'analysis', label: 'Analysis Results', icon: BarChart3 },
            { id: 'history', label: 'Import History', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === id
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-navy-400 bg-navy-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </h4>
              <p className="text-gray-500 mb-4">
                Supports CSV, JSON, and Excel formats up to 50MB
              </p>
              <input
                type="file"
                multiple
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose Files
              </label>
            </div>

            {/* Upload Progress */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-navy-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Format Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Data Format Guidelines</h5>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Include timestamp column (ISO format preferred)</p>
                <p>• Use standard sensor parameter names</p>
                <p>• Numeric values should be properly formatted</p>
                <p>• Missing values should be empty or marked as 'null'</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && selectedFile && (
          <ColumnMapper data={selectedFile} />
        )}

        {activeTab === 'analysis' && analysisResults && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Data Summary</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisResults.summary.totalRecords.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Anomalies</span>
                </div>
                <p className="text-2xl font-bold text-warning-600">
                  {analysisResults.summary.anomalies}
                </p>
                <p className="text-sm text-gray-600">Detected Issues</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Quality</span>
                </div>
                <p className="text-2xl font-bold text-safe-600 capitalize">
                  {analysisResults.summary.quality}
                </p>
                <p className="text-sm text-gray-600">Data Quality</p>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Key Insights</h5>
              <div className="space-y-2">
                {analysisResults.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-safe-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-900 mb-3">Recommendations</h5>
              <div className="space-y-2">
                {analysisResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {importedFiles.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Import History</h4>
                <p className="text-gray-500">Upload some files to see them here</p>
              </div>
            ) : (
              importedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <h5 className="font-medium">{file.filename}</h5>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{file.recordCount.toLocaleString()} records</span>
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                            <span>{file.uploadDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {file.errors.length > 0 && (
                        <div className="mt-2 text-sm text-danger-600">
                          {file.errors.length} validation error(s)
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        file.validated 
                          ? 'bg-safe-100 text-safe-700' 
                          : 'bg-warning-100 text-warning-700'
                      }`}>
                        {file.validated ? 'Validated' : 'Needs Review'}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedFile(file);
                          setShowPreview(true);
                        }}
                        className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedFile.filename} - Preview</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(false)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="p-4 overflow-auto max-h-96">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {selectedFile.columns.map((column) => (
                          <th key={column} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFile.preview.map((row, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          {selectedFile.columns.map((column) => (
                            <td key={column} className="px-4 py-2 text-sm text-gray-900">
                              {row[column]?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};