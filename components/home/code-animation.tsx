"use client"

import { useEffect, useState, useRef } from "react"

// Sample code snippets
const codeSamples = [
  "function calculateReturn(investment, period) {",
  "  return investment * Math.pow(1 + annualRate, period);",
  "}",
  "",
  "const backtest = async (strategy, assets) => {",
  "  const results = { returns: [], drawdowns: [] };",
  "  for (let day = 0; day < period; day++) {",
  "    const signal = strategy.execute(assets, day);",
  "    if (signal) portfolio.update(signal);",
  "    results.returns.push(portfolio.value);",
  "    results.drawdowns.push(calculateDrawdown());",
  "  }",
  "  return results;",
  "};",
  "",
  "class Portfolio {",
  "  constructor(initialCapital) {",
  "    this.capital = initialCapital;",
  "    this.positions = new Map();",
  "  }",
  "",
  "  get value() {",
  "    return this.capital + Array.from(this.positions.entries())",
  "      .reduce((total, [asset, qty]) => {",
  "        return total + (qty * asset.price);",
  "      }, 0);",
  "  }",
  "}",
  "",
  "const calculateDrawdown = (returns) => {",
  "  let peak = -Infinity;",
  "  return returns.map(val => {",
  "    if (val > peak) peak = val;",
  "    return (val - peak) / peak;",
  "  });",
  "}",
  "",
  "// Momentum strategy implementation",
  "class MomentumStrategy {",
  "  execute(assets, lookback = 20) {",
  "    return assets.filter(asset => {",
  "      const momentum = this.calculateMomentum(asset, lookback);",
  "      return momentum > threshold;",
  "    });",
  "  }",
  "}",
];

// Define column positions for a more organized layout
const COLUMNS = 5; // Number of columns
const VERTICAL_SPACING = 80; // Space between blocks in the same column

type CodeBlock = {
  id: number;
  column: number;
  verticalPosition: number;
  lines: string[];
  typedChars: number[];
  isTyping: boolean;
  cursorLine: number;
  typingSpeed: number;
};

export function CodeAnimation() {
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<Map<number, number>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  
  // Reset column heights
  const resetColumnHeights = () => {
    columnsRef.current = new Map();
    for (let i = 0; i < COLUMNS; i++) {
      columnsRef.current.set(i, 0);
    }
  };
  
  // Create a new code block
  const createCodeBlock = () => {
    if (!containerRef.current) return;
    
    // Find the column with the least height
    let minColumn = 0;
    let minHeight = Infinity;
    
    for (let i = 0; i < COLUMNS; i++) {
      const height = columnsRef.current.get(i) || 0;
      if (height < minHeight) {
        minHeight = height;
        minColumn = i;
      }
    }
    
    // Random starting point in the code samples
    const startIndex = Math.floor(Math.random() * (codeSamples.length - 15));
    const length = Math.floor(Math.random() * 10) + 5; // 5-15 lines of code
    const lines = codeSamples.slice(startIndex, startIndex + length);
    
    // Initialize typing progress for each line to 0 characters
    const typedChars = lines.map(() => 0);
    
    const newBlock: CodeBlock = {
      id: Date.now(),
      column: minColumn,
      verticalPosition: minHeight,
      lines,
      typedChars,
      isTyping: true,
      cursorLine: 0,
      typingSpeed: Math.floor(Math.random() * 30) + 30, // Random typing speed between 30-60ms
    };
    
    // Update the column height
    columnsRef.current.set(minColumn, minHeight + VERTICAL_SPACING);
    
    setCodeBlocks(prevBlocks => [...prevBlocks, newBlock]);
    
    // Remove the block after some time
    setTimeout(() => {
      setCodeBlocks(prevBlocks => prevBlocks.filter(block => block.id !== newBlock.id));
      
      // Update column height when block is removed
      const currentHeight = columnsRef.current.get(minColumn) || 0;
      if (currentHeight >= VERTICAL_SPACING) {
        columnsRef.current.set(minColumn, currentHeight - VERTICAL_SPACING);
      }
    }, 30000); // 30 seconds for code to type and stay visible
  };
  
  // Animate the typing effect
  const animateTyping = () => {
    setCodeBlocks(blocks => 
      blocks.map(block => {
        if (!block.isTyping) return block;
        
        const updatedTypedChars = [...block.typedChars];
        const currentLine = block.cursorLine;
        
        if (currentLine < block.lines.length) {
          const lineLength = block.lines[currentLine].length;
          
          if (updatedTypedChars[currentLine] < lineLength) {
            // Type next character in current line
            updatedTypedChars[currentLine]++;
          } else {
            // Line completed, move to next line
            if (currentLine < block.lines.length - 1) {
              return {
                ...block,
                cursorLine: currentLine + 1,
                typedChars: updatedTypedChars,
              };
            } else {
              // All lines completed
              return {
                ...block,
                isTyping: false,
                typedChars: updatedTypedChars,
              };
            }
          }
        }
        
        return {
          ...block,
          typedChars: updatedTypedChars,
        };
      })
    );
    
    animationFrameRef.current = requestAnimationFrame(() => {
      // Only run typing animation every ~45ms for a realistic typing speed
      setTimeout(animateTyping, 45);
    });
  };
  
  useEffect(() => {
    resetColumnHeights();
    
    // Start the typing animation
    animateTyping();
    
    // Initial code blocks
    const initialBlocksTimeout: NodeJS.Timeout[] = [];
    for (let i = 0; i < COLUMNS; i++) {
      initialBlocksTimeout.push(
        setTimeout(() => createCodeBlock(), i * 2000) // Stagger initial creation
      );
    }
    
    // Add new code blocks periodically
    const interval = setInterval(() => {
      if (codeBlocks.length < COLUMNS * 2) { // Limit maximum number of blocks
        createCodeBlock();
      }
    }, 5000);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      initialBlocksTimeout.forEach(timeout => clearTimeout(timeout));
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {codeBlocks.map(block => {
        const containerWidth = containerRef.current ? containerRef.current.clientWidth : 0;
        const columnWidth = containerWidth / COLUMNS;
        const left = block.column * columnWidth + (columnWidth * 0.1);
        const top = block.verticalPosition + 50; // Fixed vertical position with some offset from top
        
        return (
          <div 
            key={block.id}
            className="absolute text-gray-300 font-mono text-sm"
            style={{ 
              left: `${left}px`,
              top: `${top}px`,
              width: `${columnWidth * 0.8}px`,
              opacity: 0.98,
              textShadow: "0 0 4px rgba(0, 0, 0, 0.3)"
            }}
          >
            {block.lines.map((line, lineIndex) => (
              <div key={lineIndex} className="flex items-start relative whitespace-pre">
                <span className="truncate">
                  {block.typedChars[lineIndex] > 0 ? line.substring(0, block.typedChars[lineIndex]) : ''}
                </span>
                {block.isTyping && lineIndex === block.cursorLine && (
                  <span 
                    className="absolute inline-block h-5 w-2.5 bg-gray-300 typing-cursor"
                    style={{ 
                      left: `${block.typedChars[lineIndex] * 8}px`, // Adjusted for larger text
                    }}
                  ></span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Add this to your global CSS or update it here
const style = `
@keyframes float {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-100%);
    opacity: 0;
  }
}

.animate-fade-in-out {
  animation: float 10s linear forwards;
}
`; 