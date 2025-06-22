export function MenuGoals() {
  return (
    <div className="menu-goals">
      <div className="goals-header">
        <span className="goals-title">WHAT TO DO?</span>
      </div>

      <div className="goals-list">
        <div className={`goal-item pending`}>
          <span className="goal-indicator">{'○'}</span>
          <span className="goal-text">LOOK AROUND</span>
          <span className="goal-indicator">{'○'}</span>
          <span className="goal-text">DEMOLISH THE TOWERS</span>
        </div>
      </div>

      <style>{`
        .menu-goals {
          margin-top: 2rem;
          padding: 1.5rem;
          border: 2px solid rgba(0, 255, 0, 0.3);
          background: rgba(0, 0, 0, 0.7);
          font-family: 'Orbitron', monospace;
          animation: fadeIn 0.5s ease-out;
        }

        .goals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(0, 255, 0, 0.3);
        }

        .goals-title {
          color: #00ff00;
          font-weight: 700;
          font-size: 1.1rem;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
          letter-spacing: 2px;
        }

        .goals-counter {
          color: #66f804;
          font-weight: 400;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .goal-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.5rem;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .goal-item:hover {
          background: rgba(0, 255, 0, 0.1);
        }

        .goal-indicator {
          width: 20px;
          text-align: center;
          font-weight: bold;
          font-size: 1rem;
        }

        .goal-item.completed .goal-indicator {
          color: #00ff00;
          text-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
          animation: glow 2s ease-in-out infinite alternate;
        }

        .goal-item.pending .goal-indicator {
          color: rgba(0, 255, 0, 0.4);
          animation: blink 3s ease-in-out infinite;
        }

        .goal-text {
          color: #ffffff;
          font-size: 0.9rem;
          line-height: 1.4;
          font-weight: 400;
        }

        .goal-item.completed .goal-text {
          color: #66f804;
          opacity: 0.8;
        }

        .goal-item.pending .goal-text {
          color: rgba(255, 255, 255, 0.7);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glow {
          from {
            text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
          }
          to {
            text-shadow: 0 0 12px rgba(0, 255, 0, 1);
          }
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 0.4;
          }
          51%,
          100% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
