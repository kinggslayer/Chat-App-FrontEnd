const AttachmentPreview = ({ attachmentPreview, clearAttachment }) => {
    if (!attachmentPreview) {
      return null;
    }
  
    return (
      <div className="bg-gray-700 p-2 flex items-center">
        <div className="flex-1 flex items-center">
          {typeof attachmentPreview === 'string' && !attachmentPreview.startsWith('data:') ? (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              <span className="text-white text-sm truncate">{attachmentPreview}</span>
            </div>
          ) : (
            <img 
              src={attachmentPreview} 
              alt="Preview" 
              className="h-12 w-12 object-cover rounded"
            />
          )}
        </div>
        <button 
          onClick={clearAttachment}
          className="text-gray-400 hover:text-white p-1"
          aria-label="Remove attachment"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };
  
  export default AttachmentPreview;
  