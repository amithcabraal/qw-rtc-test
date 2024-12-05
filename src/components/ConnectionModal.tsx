import React, { useState } from 'react';
import { X, Share2, Copy } from 'lucide-react';
import { shareGameCode } from '../lib/utils';

interface ConnectionModalProps {
  isHost: boolean;
  onConnect: (code: string) => void;
  connectionCode?: string;
  onClose: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isHost,
  onConnect,
  connectionCode,
  onClose
}) => {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (connectionCode) {
      const shared = await shareGameCode(connectionCode);
      if (!shared) {
        // Fallback to copy to clipboard
        await handleCopy();
      }
    }
  };

  const handleCopy = async () => {
    if (connectionCode) {
      try {
        await navigator.clipboard.writeText(connectionCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isHost ? 'Share Game Code' : 'Join Game'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isHost ? (
          <div>
            <p className="mb-2 text-sm text-gray-600">
              Share this code with players to join your game:
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg text-2xl font-mono tracking-wider flex-1 text-center">
                {connectionCode}
              </div>
              <button
                onClick={handleShare}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="Share game code"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="Copy game code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 text-center">
                Code copied to clipboard!
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm text-gray-600">
              Enter the game code provided by the host:
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full p-2 border rounded mb-4 text-center text-xl font-mono tracking-wider"
              placeholder="ENTER CODE"
              maxLength={4}
            />
            <button
              onClick={() => onConnect(code)}
              disabled={code.length !== 4}
              className={`w-full py-2 rounded transition-colors ${
                code.length === 4
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Join Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionModal;