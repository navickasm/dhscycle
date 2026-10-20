'use client';

import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, {defaultSchema} from "rehype-sanitize";
import styles from "./messagebox.module.css";

const MAX_MESSAGE_LENGTH = 20_000;

const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        td: [...(defaultSchema.attributes?.td ?? []), ['align', 'left', 'center', 'right']],
        th: [...(defaultSchema.attributes?.th ?? []), ['align', 'left', 'center', 'right']],
    },
};

export default function MessageBox({apiBase}: { apiBase: string }) {
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchMessage = async () => {
            try {
                const response = await fetch(`${apiBase}/message.MD`, {signal: controller.signal});
                if (!response.ok) {
                    return;
                }
                const text = await response.text();
                if (text.trim().length > 0) {
                    setMessage(text.slice(0, MAX_MESSAGE_LENGTH));
                }
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error("Error fetching message:", error);
                }
            }
        };

        fetchMessage();
        return () => controller.abort();
    }, [apiBase]);

    if (!message) return null;

    return (
        <div className={styles.box}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
            >
                {message}
            </ReactMarkdown>
        </div>
    );
}
