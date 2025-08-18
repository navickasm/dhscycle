export interface NotifBoxProps {title: string, message: string, onClose?: () => void}

export default function NotifBox(p: NotifBoxProps) {
    return (
        <div style={{
            textAlign: "center",
            backgroundColor: "var(--light)",
            outline: "2px dashed var(--main)",
            width: "70vw",
            margin: "0 auto",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            position: "relative"
        }}>
            <button
                onClick={p.onClose}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "16px",
                    color: "var(--fg)",
                    cursor: "pointer"
                }}
                aria-label={"Close"}
            >
                ✖
            </button>
            <h2>{p.title}</h2>
            <p>{p.message}</p>
        </div>
    );
}