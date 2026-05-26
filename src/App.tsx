import { useEffect, useMemo, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import {
  Brush,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import './App.css'

type RadicalGroup = {
  strokes: number
  characters: string[]
}

const radicalGroups: RadicalGroup[] = [
  { strokes: 1, characters: ['一', '丨', '丶', '丿', '乙', '亅'] },
  {
    strokes: 2,
    characters: [
      '二',
      '亠',
      '人',
      '儿',
      '入',
      '八',
      '冂',
      '冖',
      '冫',
      '几',
      '凵',
      '刀',
      '力',
      '勹',
      '匕',
      '匚',
      '十',
      '卜',
      '卩',
      '厂',
      '厶',
      '又',
    ],
  },
  {
    strokes: 3,
    characters: [
      '口',
      '囗',
      '土',
      '士',
      '夂',
      '夕',
      '大',
      '女',
      '子',
      '宀',
      '寸',
      '小',
      '尢',
      '尸',
      '屮',
      '山',
      '巛',
      '工',
      '己',
      '巾',
      '干',
      '幺',
      '广',
      '廴',
      '廾',
      '弋',
      '弓',
      '彐',
      '彡',
      '彳',
    ],
  },
  {
    strokes: 4,
    characters: [
      '心',
      '戈',
      '戶',
      '手',
      '支',
      '攴',
      '文',
      '斗',
      '斤',
      '方',
      '无',
      '日',
      '曰',
      '月',
      '木',
      '欠',
      '止',
      '歹',
      '殳',
      '毋',
      '比',
      '毛',
      '氏',
      '气',
      '水',
      '火',
      '爪',
      '父',
      '爻',
      '片',
      '牙',
      '牛',
      '犬',
    ],
  },
  {
    strokes: 5,
    characters: [
      '玄',
      '玉',
      '瓜',
      '瓦',
      '甘',
      '生',
      '用',
      '田',
      '疋',
      '疒',
      '癶',
      '白',
      '皮',
      '皿',
      '目',
      '矛',
      '矢',
      '石',
      '示',
      '禸',
      '禾',
      '穴',
      '立',
    ],
  },
  {
    strokes: 6,
    characters: [
      '竹',
      '米',
      '糸',
      '缶',
      '网',
      '羊',
      '羽',
      '老',
      '而',
      '耒',
      '耳',
      '聿',
      '肉',
      '臣',
      '自',
      '至',
      '臼',
      '舌',
      '舛',
      '舟',
      '艮',
      '色',
      '艸',
      '虍',
      '虫',
      '血',
      '行',
      '衣',
      '襾',
    ],
  },
  {
    strokes: 7,
    characters: [
      '見',
      '角',
      '言',
      '谷',
      '豆',
      '豕',
      '豸',
      '貝',
      '赤',
      '走',
      '足',
      '身',
      '車',
      '辛',
      '辰',
      '辵',
      '邑',
      '酉',
      '釆',
      '里',
    ],
  },
  {
    strokes: 8,
    characters: [
      '金',
      '長',
      '門',
      '阜',
      '隶',
      '隹',
      '雨',
      '青',
      '非',
      '面',
      '革',
      '韋',
      '韭',
      '音',
      '頁',
      '風',
      '飛',
      '食',
      '首',
      '香',
    ],
  },
]

const customStorageKey = 'stroke-practice-custom-characters'

const commonCharacters = [
  '我',
  '你',
  '他',
  '她',
  '們',
  '的',
  '是',
  '不',
  '在',
  '有',
  '和',
  '人',
  '中',
  '大',
  '小',
  '上',
  '下',
  '日',
  '月',
  '水',
  '火',
  '木',
  '山',
  '田',
  '口',
  '手',
  '心',
  '子',
  '女',
  '天',
  '好',
  '早',
  '晚',
  '學',
  '校',
  '書',
  '字',
  '文',
  '看',
  '聽',
  '說',
  '讀',
  '寫',
  '吃',
  '喝',
  '來',
  '去',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
]

const strokePalette = [
  '#0f8c86',
  '#e56f57',
  '#3f6fd8',
  '#d08b12',
  '#7b5fc8',
  '#2f9a57',
  '#bd4d8d',
  '#5d7280',
  '#bf5b2b',
  '#2d8bb8',
]

function colorizeStrokePaths(host: HTMLDivElement, strokeCount: number) {
  const strokePaths = Array.from(
    host.querySelectorAll<SVGPathElement>('svg g path[clip-path][stroke]'),
  )

  strokePaths.forEach((path, index) => {
    const isGuideStroke = index < strokeCount
    const color = isGuideStroke ? '#1d2220' : strokePalette[index % strokeCount % strokePalette.length]
    if (path.getAttribute('stroke') !== color) {
      path.setAttribute('stroke', color)
    }
  })
}

function loadCachedCustomCharacters() {
  try {
    const cached = window.localStorage.getItem(customStorageKey)
    if (!cached) return []
    const parsed = JSON.parse(cached)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((character): character is string => (
        typeof character === 'string' &&
        Array.from(character).length === 1 &&
        /\p{Script=Han}/u.test(character)
      ))
      .slice(0, 48)
  } catch {
    return []
  }
}

function App() {
  const [strokeFilter, setStrokeFilter] = useState(radicalGroups[3].strokes)
  const [selectedCharacter, setSelectedCharacter] = useState('木')
  const [wordInput, setWordInput] = useState('')
  const [customCharacters, setCustomCharacters] = useState<string[]>(loadCachedCustomCharacters)
  const [mode, setMode] = useState<'trace' | 'animate'>('trace')
  const [status, setStatus] = useState('跟着灰色筆劃，用手指或滑鼠描一描。')
  const [completed, setCompleted] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [resetCount, setResetCount] = useState(0)
  const writerRef = useRef<HanziWriter | null>(null)
  const writerHostRef = useRef<HTMLDivElement | null>(null)

  const selectedGroup = useMemo(
    () => radicalGroups.find((group) => group.strokes === strokeFilter) ?? radicalGroups[0],
    [strokeFilter],
  )

  const allCharacters = useMemo(
    () => [...radicalGroups.flatMap((group) => group.characters), ...commonCharacters, ...customCharacters],
    [customCharacters],
  )

  useEffect(() => {
    const host = writerHostRef.current
    if (!host) return

    host.innerHTML = ''
    setMistakes(0)
    setCompleted(0)
    setStatus('載入筆順中...')

    const size = Math.min(Math.max(host.clientWidth, 280), 430)

    const writer = HanziWriter.create(host, selectedCharacter, {
      width: size,
      height: size,
      padding: 18,
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1.1,
      delayBetweenStrokes: 140,
      drawingWidth: 34,
      strokeColor: '#1d2220',
      outlineColor: '#1d2220',
      radicalColor: '#e56f57',
      drawingColor: '#0f8c86',
      highlightColor: '#e56f57',
    })

    writerRef.current = writer
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => {
        writer
          .getCharacterData()
          .then((character) => colorizeStrokePaths(host, character.strokes.length))
      })
    })

    observer.observe(host, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    writer.getCharacterData().then((character) => colorizeStrokePaths(host, character.strokes.length))

    writer
      .quiz({
        leniency: 1.25,
        showHintAfterMisses: 2,
        highlightOnComplete: true,
        onCorrectStroke: (data) => {
          setCompleted(data.strokeNum + 1)
          setStatus(data.strokesRemaining === 0 ? '完成！再試下一個字。' : '好，下一筆。')
        },
        onMistake: (data) => {
          setMistakes(data.totalMistakes)
          setStatus('再試一次，留意起筆和方向。')
        },
        onComplete: (summary) => {
          setCompleted((count) => Math.max(count, 1))
          setStatus(`${summary.character} 完成，共 ${summary.totalMistakes} 次修正。`)
        },
      })
      .then(() => setStatus('跟着灰色筆劃，用手指或滑鼠描一描。'))
      .catch(() => {
        setStatus('這個字暫時未能載入筆順，請試另一個。')
      })

    return () => {
      observer.disconnect()
      writer.cancelQuiz()
    }
  }, [selectedCharacter, resetCount])

  useEffect(() => {
    window.localStorage.setItem(customStorageKey, JSON.stringify(customCharacters))
  }, [customCharacters])

  function startQuiz() {
    setMode('trace')
    setMistakes(0)
    setCompleted(0)
    setStatus('重新開始，慢慢描。')
    writerRef.current?.cancelQuiz()
    writerRef.current?.hideCharacter({ duration: 120 })
    writerRef.current?.showOutline({ duration: 120 })
    writerRef.current?.quiz({
      leniency: 1.25,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onCorrectStroke: (data) => {
        setCompleted(data.strokeNum + 1)
        setStatus(data.strokesRemaining === 0 ? '完成！再試下一個字。' : '好，下一筆。')
      },
      onMistake: (data) => {
        setMistakes(data.totalMistakes)
        setStatus('再試一次，留意起筆和方向。')
      },
      onComplete: (summary) => {
        setStatus(`${summary.character} 完成，共 ${summary.totalMistakes} 次修正。`)
      },
    })
  }

  function animateCharacter() {
    setMode('animate')
    setStatus('先看筆順，再按練習。')
    writerRef.current?.cancelQuiz()
    writerRef.current?.hideCharacter({ duration: 120 })
    writerRef.current?.animateCharacter()
  }

  function moveSelection(direction: -1 | 1) {
    const currentIndex = allCharacters.indexOf(selectedCharacter)
    const nextIndex = (currentIndex + direction + allCharacters.length) % allCharacters.length
    const nextCharacter = allCharacters[nextIndex]
    const nextGroup = radicalGroups.find((group) => group.characters.includes(nextCharacter))
    setSelectedCharacter(nextCharacter)
    if (nextGroup) setStrokeFilter(nextGroup.strokes)
  }

  function addCustomCharacters() {
    const nextCharacters = Array.from(wordInput)
      .map((character) => character.trim())
      .filter((character) => /\p{Script=Han}/u.test(character))

    if (nextCharacters.length === 0) {
      setStatus('請輸入中文字，例如：學校。')
      return
    }

    setCustomCharacters((current) => {
      const merged = [...current]
      nextCharacters.forEach((character) => {
        if (!merged.includes(character)) merged.push(character)
      })
      return merged.slice(0, 48)
    })
    setSelectedCharacter(nextCharacters[0])
    setWordInput('')
    setStatus('已加入你的練習字。')
  }

  function clearCustomCharacters() {
    setCustomCharacters([])
    setSelectedCharacter('木')
    setStrokeFilter(4)
    setStatus('已清除自訂練習字。')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>筆劃練習</h1>
          <p>按筆畫選部首，跟着筆順描寫。</p>
        </div>
        <a href="https://www.edbchinese.hk/lexlist_ch/" target="_blank" rel="noreferrer">
          EDB 詞彙表
        </a>
      </header>

      <section className="practice-layout" aria-label="Chinese stroke practice">
        <aside className="selector-panel">
          <div className="panel-heading">
            <span>筆畫</span>
            <strong>{selectedGroup.characters.length} 個</strong>
          </div>
          <div className="stroke-tabs" role="tablist" aria-label="Stroke count">
            {radicalGroups.map((group) => (
              <button
                type="button"
                role="tab"
                aria-selected={strokeFilter === group.strokes}
                className={strokeFilter === group.strokes ? 'active' : ''}
                key={group.strokes}
                onClick={() => {
                  setStrokeFilter(group.strokes)
                  setSelectedCharacter(group.characters[0])
                }}
              >
                {group.strokes}畫
              </button>
            ))}
          </div>

          <div className="character-grid" aria-label={`${strokeFilter} stroke radicals`}>
            {selectedGroup.characters.map((character) => (
              <button
                type="button"
                className={selectedCharacter === character ? 'character active' : 'character'}
                key={character}
                onClick={() => setSelectedCharacter(character)}
              >
                {character}
              </button>
            ))}
          </div>

          <div className="quick-heading">
            <span>常用字</span>
            <strong>{commonCharacters.length} 個</strong>
          </div>
          <div className="quick-row" aria-label="Common practice characters">
            {commonCharacters.map((word) => (
              <button
                type="button"
                className={selectedCharacter === word ? 'active' : ''}
                key={word}
                onClick={() => setSelectedCharacter(word)}
              >
                {word}
              </button>
            ))}
          </div>

          <form
            className="add-word-form"
            onSubmit={(event) => {
              event.preventDefault()
              addCustomCharacters()
            }}
          >
            <label htmlFor="word-input">加入練習字</label>
            <div className="input-row">
              <input
                id="word-input"
                maxLength={16}
                placeholder="例如：學校"
                value={wordInput}
                onChange={(event) => setWordInput(event.target.value)}
              />
              <button type="submit" aria-label="Add custom words">
                <Plus size={18} />
              </button>
            </div>
            <div className="custom-row" aria-label="Custom practice words">
              {customCharacters.map((character) => (
                <button
                  type="button"
                  className={selectedCharacter === character ? 'active' : ''}
                  key={character}
                  onClick={() => setSelectedCharacter(character)}
                >
                  {character}
                </button>
              ))}
            </div>
            {customCharacters.length > 0 && (
              <button type="button" className="clear-custom" onClick={clearCustomCharacters}>
                <Trash2 size={16} />
                清除自訂
              </button>
            )}
          </form>
        </aside>

        <section className="writer-panel">
          <div className="writer-heading">
            <button type="button" className="icon-button" onClick={() => moveSelection(-1)} aria-label="Previous character">
              <ChevronLeft size={22} />
            </button>
            <div>
              <span>現在練習</span>
              <strong>{selectedCharacter}</strong>
            </div>
            <button type="button" className="icon-button" onClick={() => moveSelection(1)} aria-label="Next character">
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="writer-stage">
            <div className="guide-lines" aria-hidden="true" />
            <div ref={writerHostRef} className="writer-target" aria-label={`${selectedCharacter} tracing canvas`} />
          </div>

          <div className="toolbar" aria-label="Practice controls">
            <button type="button" className={mode === 'trace' ? 'primary active' : 'primary'} onClick={startQuiz}>
              <Brush size={18} />
              練習
            </button>
            <button type="button" onClick={animateCharacter}>
              <Play size={18} />
              示範
            </button>
            <button type="button" onClick={startQuiz}>
              <Eraser size={18} />
              清除
            </button>
            <button type="button" onClick={() => setResetCount((count) => count + 1)}>
              <RotateCcw size={18} />
              重載
            </button>
          </div>
        </section>

        <aside className="progress-panel">
          <div className="status-card">
            <Sparkles size={20} />
            <p>{status}</p>
          </div>
          <div className="stat-row">
            <span>完成筆數</span>
            <strong>{completed}</strong>
          </div>
          <div className="stat-row">
            <span>修正次數</span>
            <strong>{mistakes}</strong>
          </div>
          <div className="done-note">
            <CheckCircle2 size={18} />
            <span>手機和平板可直接用手指描寫。</span>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
