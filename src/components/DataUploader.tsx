import React, { useState, DragEvent } from 'react';

interface DataUploaderProps {
  onDataUpload: (file: File) => void;
  label?: string; // Texto a mostrar en el "drop zone"
}

export const DataUploader: React.FC<DataUploaderProps> = ({
  onDataUpload,
  label = 'Arrastra tu archivo CSV o haz clic para seleccionar',
}) => {
  // Estado para manejar si estamos sobre la zona de drop
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Manejadores de drag & drop
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onDataUpload(selectedFile);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <label
        className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-md cursor-pointer 
          transition-colors duration-300 
          ${
            isDragging
              ? 'bg-blue-100 border-blue-400'
              : 'bg-gray-50 border-gray-300'
          }
          hover:border-blue-400 hover:bg-blue-50
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute h-full w-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center pointer-events-none">
          <svg
            className={`w-16 h-16 mb-2 text-gray-400 transition-transform ${
              isDragging ? 'animate-bounce' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-gray-700 text-center px-2">
            {selectedFile
              ? `Archivo seleccionado: ${selectedFile.name}`
              : label}
          </p>
        </div>
      </label>

      <div className="mt-4 text-center">
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className={`
            px-4 py-2 text-white font-medium rounded 
            ${
              selectedFile
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          Subir
        </button>
      </div>
    </div>
  );
};
