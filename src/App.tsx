import { useEffect, useMemo, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import {
  Brush,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eraser,
  BookOpen,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import './App.css'

type RadicalGroup = {
  strokes: number
  characters: string[]
}

type DictionaryEntry = {
  jyutping: string
  pinyin: string
  meaning: string
  examples: string[]
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

const dictionaryEntries: Record<string, DictionaryEntry> = {
  一: { jyutping: 'jat1', pinyin: 'yi1', meaning: 'one; first', examples: ['一個', '一日', '第一'] },
  二: { jyutping: 'ji6', pinyin: 'er4', meaning: 'two', examples: ['二月', '二人', '第二'] },
  三: { jyutping: 'saam1', pinyin: 'san1', meaning: 'three', examples: ['三日', '三個', '三年'] },
  四: { jyutping: 'sei3', pinyin: 'si4', meaning: 'four', examples: ['四月', '四方', '第四'] },
  五: { jyutping: 'ng5', pinyin: 'wu3', meaning: 'five', examples: ['五月', '五個', '星期五'] },
  六: { jyutping: 'luk6', pinyin: 'liu4', meaning: 'six', examples: ['六月', '六個', '星期六'] },
  七: { jyutping: 'cat1', pinyin: 'qi1', meaning: 'seven', examples: ['七月', '七個', '七天'] },
  八: { jyutping: 'baat3', pinyin: 'ba1', meaning: 'eight', examples: ['八月', '八個', '八方'] },
  九: { jyutping: 'gau2', pinyin: 'jiu3', meaning: 'nine', examples: ['九月', '九個', '九龍'] },
  十: { jyutping: 'sap6', pinyin: 'shi2', meaning: 'ten', examples: ['十月', '十個', '十分'] },
  我: { jyutping: 'ngo5', pinyin: 'wo3', meaning: 'I; me', examples: ['我們', '我家', '我的'] },
  你: { jyutping: 'nei5', pinyin: 'ni3', meaning: 'you', examples: ['你好', '你們', '你的'] },
  他: { jyutping: 'taa1', pinyin: 'ta1', meaning: 'he; him', examples: ['他們', '他的', '他人'] },
  她: { jyutping: 'taa1', pinyin: 'ta1', meaning: 'she; her', examples: ['她們', '她的', '她家'] },
  們: { jyutping: 'mun4', pinyin: 'men5', meaning: 'plural marker for people', examples: ['我們', '你們', '同學們'] },
  的: { jyutping: 'dik1', pinyin: 'de5', meaning: 'possessive particle; of', examples: ['我的', '好的', '看的'] },
  是: { jyutping: 'si6', pinyin: 'shi4', meaning: 'to be; yes', examples: ['我是', '不是', '是的'] },
  不: { jyutping: 'bat1', pinyin: 'bu4', meaning: 'not; no', examples: ['不是', '不好', '不用'] },
  在: { jyutping: 'zoi6', pinyin: 'zai4', meaning: 'at; in; to be located', examples: ['在家', '現在', '在校'] },
  有: { jyutping: 'jau5', pinyin: 'you3', meaning: 'to have; there is', examples: ['有人', '有用', '沒有'] },
  和: { jyutping: 'wo4', pinyin: 'he2', meaning: 'and; harmony', examples: ['我和你', '和平', '和好'] },
  人: { jyutping: 'jan4', pinyin: 'ren2', meaning: 'person; people', examples: ['大人', '小人', '中國人'] },
  中: { jyutping: 'zung1', pinyin: 'zhong1', meaning: 'middle; China; Chinese', examples: ['中文', '中國', '中間'] },
  大: { jyutping: 'daai6', pinyin: 'da4', meaning: 'big; great', examples: ['大人', '大學', '大山'] },
  小: { jyutping: 'siu2', pinyin: 'xiao3', meaning: 'small; young', examples: ['小學', '小心', '小朋友'] },
  上: { jyutping: 'soeng6', pinyin: 'shang4', meaning: 'up; above; previous', examples: ['上學', '上面', '上午'] },
  下: { jyutping: 'haa6', pinyin: 'xia4', meaning: 'down; below; next', examples: ['下學', '下面', '下午'] },
  日: { jyutping: 'jat6', pinyin: 'ri4', meaning: 'sun; day', examples: ['生日', '日子', '明日'] },
  月: { jyutping: 'jyut6', pinyin: 'yue4', meaning: 'moon; month', examples: ['月亮', '一月', '年月'] },
  水: { jyutping: 'seoi2', pinyin: 'shui3', meaning: 'water', examples: ['喝水', '水果', '水火'] },
  火: { jyutping: 'fo2', pinyin: 'huo3', meaning: 'fire', examples: ['火山', '火車', '水火'] },
  木: { jyutping: 'muk6', pinyin: 'mu4', meaning: 'wood; tree', examples: ['木頭', '木馬', '樹木'] },
  山: { jyutping: 'saan1', pinyin: 'shan1', meaning: 'mountain', examples: ['火山', '山上', '大山'] },
  田: { jyutping: 'tin4', pinyin: 'tian2', meaning: 'field; farmland', examples: ['田地', '水田', '田園'] },
  口: { jyutping: 'hau2', pinyin: 'kou3', meaning: 'mouth; opening', examples: ['入口', '出口', '人口'] },
  手: { jyutping: 'sau2', pinyin: 'shou3', meaning: 'hand', examples: ['手指', '手機', '小手'] },
  心: { jyutping: 'sam1', pinyin: 'xin1', meaning: 'heart; mind', examples: ['小心', '開心', '中心'] },
  子: { jyutping: 'zi2', pinyin: 'zi3', meaning: 'child; son; suffix', examples: ['日子', '兒子', '孩子'] },
  女: { jyutping: 'neoi5', pinyin: 'nu3', meaning: 'female; woman', examples: ['女人', '女子', '女兒'] },
  天: { jyutping: 'tin1', pinyin: 'tian1', meaning: 'sky; day', examples: ['今天', '天空', '天氣'] },
  好: { jyutping: 'hou2', pinyin: 'hao3', meaning: 'good; well', examples: ['你好', '好人', '好學'] },
  早: { jyutping: 'zou2', pinyin: 'zao3', meaning: 'early; morning', examples: ['早晨', '早上', '早日'] },
  晚: { jyutping: 'maan5', pinyin: 'wan3', meaning: 'late; evening', examples: ['晚上', '晚安', '今晚'] },
  學: { jyutping: 'hok6', pinyin: 'xue2', meaning: 'to learn; study; school', examples: ['學校', '學生', '學中文'] },
  校: { jyutping: 'haau6', pinyin: 'xiao4', meaning: 'school', examples: ['學校', '校長', '小學'] },
  書: { jyutping: 'syu1', pinyin: 'shu1', meaning: 'book; letter; writing', examples: ['書本', '看書', '中文書'] },
  字: { jyutping: 'zi6', pinyin: 'zi4', meaning: 'character; word', examples: ['中文字', '寫字', '字典'] },
  文: { jyutping: 'man4', pinyin: 'wen2', meaning: 'language; writing; culture', examples: ['中文', '英文', '文字'] },
  看: { jyutping: 'hon3', pinyin: 'kan4', meaning: 'to look; to read', examples: ['看書', '看見', '看看'] },
  聽: { jyutping: 'ting1', pinyin: 'ting1', meaning: 'to listen; to hear', examples: ['聽書', '聽見', '聽說'] },
  說: { jyutping: 'syut3', pinyin: 'shuo1', meaning: 'to speak; to say', examples: ['說話', '聽說', '說中文'] },
  讀: { jyutping: 'duk6', pinyin: 'du2', meaning: 'to read; to study', examples: ['讀書', '讀音', '讀中文'] },
  寫: { jyutping: 'se2', pinyin: 'xie3', meaning: 'to write', examples: ['寫字', '寫書', '手寫'] },
  吃: { jyutping: 'hek3', pinyin: 'chi1', meaning: 'to eat', examples: ['吃飯', '好吃', '吃水果'] },
  喝: { jyutping: 'hot3', pinyin: 'he1', meaning: 'to drink', examples: ['喝水', '喝茶', '喝湯'] },
  來: { jyutping: 'loi4', pinyin: 'lai2', meaning: 'to come', examples: ['回來', '來看', '來日'] },
  去: { jyutping: 'heoi3', pinyin: 'qu4', meaning: 'to go', examples: ['去學校', '出去', '去看'] },
}

const dictionaryChineseMeanings: Record<string, string> = {
  一: '數字一；第一',
  二: '數字二',
  三: '數字三',
  四: '數字四',
  五: '數字五',
  六: '數字六',
  七: '數字七',
  八: '數字八',
  九: '數字九',
  十: '數字十',
  我: '自己；說話的人',
  你: '對方；聽話的人',
  他: '男性第三人稱',
  她: '女性第三人稱',
  們: '表示多於一個人的後綴',
  的: '表示所屬或修飾關係',
  是: '表示肯定或判斷',
  不: '表示否定',
  在: '表示位置、存在或正在進行',
  有: '擁有；存在',
  和: '連接詞；和諧',
  人: '人；人類',
  中: '中間；中國；中文',
  大: '體積、程度或年紀較大',
  小: '體積、程度或年紀較小',
  上: '上面；向上；前一個',
  下: '下面；向下；下一個',
  日: '太陽；一天；日子',
  月: '月亮；月份',
  水: '水；液體',
  火: '火；燃燒的現象',
  木: '木頭；樹木',
  山: '山；高起的地形',
  田: '田地；農田',
  口: '嘴巴；出入口',
  手: '手；用手做事',
  心: '心；思想或感情',
  子: '孩子；兒子；詞尾',
  女: '女性；女子',
  天: '天空；一天；自然',
  好: '良好；喜歡；可以',
  早: '時間較前；早上',
  晚: '時間較後；晚上',
  學: '學習；求知；學校',
  校: '學校；校園',
  書: '書本；文字記錄',
  字: '文字；字詞',
  文: '文字；語文；文化',
  看: '用眼睛觀看；閱讀',
  聽: '用耳朵接收聲音',
  說: '講話；表達',
  讀: '閱讀；朗讀；學習',
  寫: '書寫；寫下',
  吃: '進食',
  喝: '飲用',
  來: '到這裡；來到',
  去: '離開；前往',
}

function getDictionaryLinks(character: string) {
  const encodedCharacter = encodeURIComponent(character)
  return {
    edb: `https://www.edbchinese.hk/lexlist_en/index.jsp#${encodedCharacter}`,
    cuhk: 'https://humanum.arts.cuhk.edu.hk/Lexis/lexi-can/',
  }
}

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
  const [dictionaryInput, setDictionaryInput] = useState('')
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

  const dictionaryEntry = dictionaryEntries[selectedCharacter]
  const dictionaryChineseMeaning = dictionaryChineseMeanings[selectedCharacter]
  const dictionaryLinks = getDictionaryLinks(selectedCharacter)

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

  function lookupDictionaryCharacter() {
    const character = Array.from(dictionaryInput).find((inputCharacter) => (
      /\p{Script=Han}/u.test(inputCharacter)
    ))

    if (!character) {
      setStatus('請輸入一個中文字來查字典。')
      return
    }

    setSelectedCharacter(character)
    setDictionaryInput('')
    setStatus(dictionaryEntries[character] ? '已打開字典資料。' : '可用外部字典查更多資料。')
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
          <section className="dictionary-card" aria-label="Dictionary">
            <div className="dictionary-heading">
              <BookOpen size={19} />
              <span>字典</span>
              <strong>{selectedCharacter}</strong>
            </div>
            <form
              className="dictionary-search"
              onSubmit={(event) => {
                event.preventDefault()
                lookupDictionaryCharacter()
              }}
            >
              <input
                aria-label="Dictionary lookup"
                maxLength={12}
                placeholder="查字，例如：愛"
                value={dictionaryInput}
                onChange={(event) => setDictionaryInput(event.target.value)}
              />
              <button type="submit" aria-label="Search dictionary">
                <Search size={17} />
              </button>
            </form>
            {dictionaryEntry ? (
              <div className="dictionary-body">
                <div className="pronunciation-grid">
                  <div>
                    <span>粵語拼音</span>
                    <strong>{dictionaryEntry.jyutping}</strong>
                  </div>
                  <div>
                    <span>漢語拼音</span>
                    <strong>{dictionaryEntry.pinyin}</strong>
                  </div>
                </div>
                <p className="pronunciation-note">粵語拼音以香港語言學學會方案標示，請以 CUHK 粵音韻彙核對完整讀音。</p>
                <div className="meaning-list">
                  <div>
                    <span>中文</span>
                    <p>{dictionaryChineseMeaning}</p>
                  </div>
                  <div>
                    <span>English</span>
                    <p>{dictionaryEntry.meaning}</p>
                  </div>
                </div>
                <div className="example-list">
                  {dictionaryEntry.examples.map((example) => (
                    <button
                      type="button"
                      key={example}
                      onClick={() => setSelectedCharacter(Array.from(example)[0])}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="dictionary-empty">暫時未有本機解釋，請用 EDB 詞彙表或 CUHK 粵音韻彙查更多。</p>
            )}
            <div className="dictionary-links">
              <a href={dictionaryLinks.edb} target="_blank" rel="noreferrer">
                EDB 詞彙表
              </a>
              <a href={dictionaryLinks.cuhk} target="_blank" rel="noreferrer">
                CUHK 粵音韻彙
              </a>
            </div>
          </section>
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
