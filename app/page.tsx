"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [players, setPlayers] = useState([{ id: 1, name: "" }])
  const [totalRounds, setTotalRounds] = useState(5)
  const [currentRound, setCurrentRound] = useState(1)
  const [scores, setScores] = useState<{ [key: number]: number[] }>({})
  const [isStarted, setIsStarted] = useState(false)
  const [currentInputs, setCurrentInputs] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    loadGame()
  }, [])

  const loadGame = async () => {
    const { data } = await supabase
      .from("game_state")
      .select("*")
      .eq("id", 1)
      .single()

    if (data) {
      setPlayers(data.players?.length ? data.players : [{ id: 1, name: "" }])
      setScores(data.scores || {})
      setTotalRounds(data.total_rounds || 5)
      setCurrentRound(data.current_round || 1)
      setIsStarted(data.is_started || false)
    }
  }

  const saveGame = async () => {
    await supabase.from("game_state").update({
      players,
      scores,
      total_rounds: totalRounds,
      current_round: currentRound,
      is_started: isStarted
    }).eq("id", 1)

    alert("저장되었습니다 ✅")
  }

  const resetGame = async () => {
    if (!confirm("정말 새 게임을 시작하시겠습니까?")) return

    await supabase.from("game_state").update({
      players: [{ id: 1, name: "" }],
      scores: {},
      total_rounds: 5,
      current_round: 1,
      is_started: false
    }).eq("id", 1)

    setPlayers([{ id: 1, name: "" }])
    setScores({})
    setTotalRounds(5)
    setCurrentRound(1)
    setIsStarted(false)
    setCurrentInputs({})
  }

  const addPlayer = () => {
    setPlayers([...players, { id: Date.now(), name: "" }])
  }

  const removePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id))
  }

  // ✅ 현재 판 점수 확정
  const submitRound = () => {
    if (currentRound > totalRounds) return

    const updated = { ...scores }

    players.forEach(player => {
      const value = Number(currentInputs[player.id] || 0)

      if (!updated[player.id]) {
        updated[player.id] = []
      }

      updated[player.id][currentRound - 1] = value
    })

    setScores(updated)
    setCurrentInputs({})
    setCurrentRound(prev => prev + 1)
  }

  // ✅ 지난 점수 수정
  const updatePastScore = (
    playerId: number,
    roundIndex: number,
    value: string
  ) => {
    const updated = { ...scores }

    if (!updated[playerId]) updated[playerId] = []

    updated[playerId][roundIndex] = Number(value)
    setScores(updated)
  }

  const getTotalScore = (playerId: number) => {
    return (scores[playerId] || []).reduce(
      (a, b) => a + (b || 0),
      0
    )
  }

  return (
    <div className="min-h-screen bg-sky-100 p-8">

      {/* 상단 버튼 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={saveGame}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          💾 저장
        </button>

        <button
          onClick={resetGame}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          🔄 새 게임
        </button>
      </div>

      {/* 설정 화면 */}
      {!isStarted && (
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-sky-600 mb-4">
            게임 설정
          </h1>

          <input
            type="number"
            value={totalRounds}
            onChange={(e) => setTotalRounds(Number(e.target.value))}
            className="w-full mb-4 p-2 border rounded"
          />

          {players.map((player, i) => (
            <div key={player.id} className="flex gap-2 mb-2">
              <input
                value={player.name}
                onChange={(e) => {
                  const newPlayers = [...players]
                  newPlayers[i].name = e.target.value
                  setPlayers(newPlayers)
                }}
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => removePlayer(player.id)}
                className="bg-red-400 text-white px-3 rounded"
              >
                삭제
              </button>
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            <button
              onClick={addPlayer}
              className="bg-sky-400 text-white px-4 py-2 rounded"
            >
              플레이어 추가
            </button>

            <button
              onClick={() => setIsStarted(true)}
              className="bg-sky-600 text-white px-4 py-2 rounded"
            >
              시작
            </button>
          </div>
        </div>
      )}

      {/* 게임 화면 */}
      {isStarted && (
        <>
          <h2 className="text-2xl font-bold text-center text-sky-700 mb-4">
            {Math.min(currentRound, totalRounds)} / {totalRounds} 판
          </h2>

          <div className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
            <table className="w-full text-center border">
              <thead className="bg-sky-200">
                <tr>
                  <th className="border p-2">판</th>
                  {players.map(player => (
                    <th key={player.id} className="border p-2">
                      {player.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[...Array(totalRounds)].map((_, roundIndex) => (
                  <tr key={roundIndex}>
                    <td className="border p-2">
                      {roundIndex + 1}
                    </td>

                    {players.map(player => {
                      const isCurrent =
                        roundIndex === currentRound - 1 &&
                        currentRound <= totalRounds

                      return (
                        <td key={player.id} className="border p-2">
                          {isCurrent ? (
                            // ✅ 현재 판 입력창
                            <input
                              type="number"
                              value={
                                currentInputs[player.id] || ""
                              }
                              onChange={(e) =>
                                setCurrentInputs({
                                  ...currentInputs,
                                  [player.id]: e.target.value
                                })
                              }
                              className="w-20 text-center border rounded p-1 bg-yellow-100"
                            />
                          ) : (
                            // ✅ 과거 점수 수정 가능
                            <input
                              type="number"
                              value={
                                scores[player.id]?.[roundIndex] ??
                                ""
                              }
                              onChange={(e) =>
                                updatePastScore(
                                  player.id,
                                  roundIndex,
                                  e.target.value
                                )
                              }
                              className="w-20 text-center border rounded p-1"
                            />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}

                <tr className="font-bold bg-sky-100">
                  <td className="border p-2">총점</td>
                  {players.map(player => (
                    <td key={player.id} className="border p-2">
                      {getTotalScore(player.id)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {currentRound <= totalRounds && (
            <div className="text-center mt-4">
              <button
                onClick={submitRound}
                className="bg-sky-600 text-white px-6 py-2 rounded"
              >
                다음 판
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
