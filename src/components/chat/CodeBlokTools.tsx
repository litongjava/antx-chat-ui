import {Check, CirclePlay, Copy} from "lucide-react";
import {useState} from "react";

interface Props {
  id: string;
  language: string;
  onRun?: (code: string, language: string) => void;
}

const CodeBlokTools = ({id, language, onRun}: Props) => {
  // 修正状态变量和 setter 的命名
  const [copied, setCopied] = useState(false);
  const [runed, setRuned] = useState(false);

  const onCopy = async () => {
    try {
      const text = document.getElementById(id)!.innerText;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // 1 秒后恢复
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const onRunClick = async () => {
    try {
      const text = document.getElementById(id)!.innerText;
      if (onRun) onRun(text, language);
      setRuned(true);
      // 1 秒后恢复
      setTimeout(() => {
        setRuned(false);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={onCopy}>
        {copied
          ? <Check size={16}/>
          : <Copy size={16}/>
        }
        <span>Copy</span>
      </button>

      <button onClick={onRunClick}>
        {runed
          ? <Check size={16}/>
          : <CirclePlay size={16}/>
        }
        <span>Run</span>
      </button>

    </div>

  );
};

export default CodeBlokTools;
