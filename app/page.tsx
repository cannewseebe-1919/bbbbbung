"use client"

import { useState } from "react"

export default function Home() {
  const [players, setPlayers] = useState([{ id: 1, name: "" }])
  const [totalRounds, setTotalRounds] = useState(5)
  const [currentRound, setCurrentRound] = useState(1)
  const [scores, setScores] = useState<{ [key: number]: number[] }>({})
  const [isStarted, setIsStarted] = useState(false)
  const [currentInputs, setCurrentInputs] = useState<{ [key: number]: string }>({})
  const [editing, setEditing] = useState<{
    playerId: number
    roundIndex: number
  } | null>(null)

  const addPlayer = () => {
    setPlayers([...players, { id: Date.now(), name: "" }])
  }

  const removePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id))
  }

  // 점수 수정 함수
  const handleScoreChange = (
    playerId: number,
    roundIndex: number,
    value: number
  ) => {
    setScores(prev => {
      const updated = { ...prev }
      if (!updated[playerId]) updated[playerId] = []
      updated[playerId][roundIndex] = value
      return updated
    })
  }

  const nextRound = () => {
    if (currentRound <= totalRounds) {
      setScores(prev => {
        const updated = { ...prev }

        players.forEach(player => {
          const value = Number(currentInputs[player.id] || 0)
          if (!updated[player.id]) updated[player.id] = []
          updated[player.id][currentRound - 1] = value
        })

        return updated
      })

      setCurrentInputs({})
      setCurrentRound(prev => prev + 1)
    }
  }

  const getTotalScore = (playerId: number) => {
    return (scores[playerId] || []).reduce((a, b) => a + (b || 0), 0)
  }

  const isCurrentRoundComplete = () => {
    return players.every(
      player =>
        currentInputs[player.id] !== undefined &&
        currentInputs[player.id] !== ""
    )
  }

  // 🏆 순위 계산
  const rankedPlayers = [...players]
    .map(player => ({
      id: player.id,
      total: getTotalScore(player.id)
    }))
    .sort((a, b) => b.total - a.total)

  const rankMap: { [key: number]: number } = {}
  rankedPlayers.forEach((player, index) => {
    rankMap[player.id] = index + 1
  })

  return (
    <div className="min-h-screen bg-sky-100 p-8">
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
                placeholder={`플레이어 ${i + 1}`}
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

      {isStarted && (
        <>
          <h2 className="text-2xl font-bold text-center text-sky-700 mb-4">
            {currentRound} / {totalRounds} 판
          </h2>

          {/* 상단 점수 입력 */}
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              {players.map(player => (
                <div key={player.id} className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {player.name}
                  </span>
                  <input
                    type="number"
                    value={currentInputs[player.id] || ""}
                    onChange={(e) =>
                      setCurrentInputs({
                        ...currentInputs,
                        [player.id]: e.target.value
                      })
                    }
                    className="w-20 p-1 border rounded text-center"
                  />
                </div>
              ))}

              <button
                onClick={nextRound}
                disabled={!isCurrentRoundComplete()}
                className={`px-4 py-1 rounded text-white text-sm ${
                  isCurrentRoundComplete()
                    ? "bg-sky-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                다음 판
              </button>
            </div>
          </div>

          {/* 점수표 */}
          <div className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
            <table className="w-full text-center border">
              <thead className="bg-sky-200">
                <tr>
                  <th className="border p-2">판</th>
                  {players.map(player => (
                    <th key={player.id} className="border p-2">
                      <div className="flex items-center justify-center gap-1">
                        {player.name}
                        {rankMap[player.id] === 1 && "🥇"}
                        {rankMap[player.id] === 2 && "🥈"}
                        {rankMap[player.id] === 3 && "🥉"}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[...Array(totalRounds)].map((_, roundIndex) => (
                  <tr
                    key={roundIndex}
                    className={
                      roundIndex === currentRound - 1
                        ? "bg-sky-100"
                        : ""
                    }
                  >
                    <td className="border p-2 font-semibold">
                      {roundIndex + 1}판
                    </td>

                    {players.map(player => {
                      const isEditing =
                        editing?.playerId === player.id &&
                        editing?.roundIndex === roundIndex

                      return (
                        <td
                          key={player.id}
                          className="border p-2 cursor-pointer"
                          onClick={() =>
                            setEditing({
                              playerId: player.id,
                              roundIndex
                            })
                          }
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              autoFocus
                              defaultValue={
                                scores[player.id]?.[roundIndex] ?? ""
                              }
                              className="w-16 p-1 border rounded text-center"
                              onBlur={(e) => {
                                handleScoreChange(
                                  player.id,
                                  roundIndex,
                                  Number(e.target.value)
                                )
                                setEditing(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleScoreChange(
                                    player.id,
                                    roundIndex,
                                    Number(
                                      (e.target as HTMLInputElement).value
                                    )
                                  )
                                  setEditing(null)
                                }
                              }}
                            />
                          ) : (
                            scores[player.id]?.[roundIndex] ?? "-"
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {/* 총점 */}
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
        </>
      )}
    </div>
  )
}
