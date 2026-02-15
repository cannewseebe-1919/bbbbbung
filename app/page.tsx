"use client"

import { useState } from "react"

export default function Home() {
  const [players, setPlayers] = useState([{ id: 1, name: "" }])
  const [totalRounds, setTotalRounds] = useState(5)
  const [currentRound, setCurrentRound] = useState(1)
  const [scores, setScores] = useState<{ [key: number]: number[] }>({})
  const [isStarted, setIsStarted] = useState(false)
  const [currentInputs, setCurrentInputs] = useState<{ [key: number]: string }>({})
  // 수정 중인 셀 상태
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

  const handleScoreChange = (playerId: number, roundIndex: number, value: number) => {
    const newScores = { ...scores }
    if (!newScores[playerId]) newScores[playerId] = []
    newScores[playerId][roundIndex] = value
    setScores(newScores)
  }

  const nextRound = () => {
    if (currentRound <= totalRounds) {

      // 점수 저장
      players.forEach(player => {
        const value = Number(currentInputs[player.id] || 0)
        handleScoreChange(player.id, currentRound - 1, value)
      })

      // 입력창 초기화
      setCurrentInputs({})

      setCurrentRound(prev => prev + 1)
    }
  }

  const getTotalScore = (playerId: number) => {
    return (scores[playerId] || []).reduce((a, b) => a + (b || 0), 0)
  }

const isCurrentRoundComplete = () => {
  return players.every(player =>
    currentInputs[player.id] !== undefined &&
    currentInputs[player.id] !== ""
  )
}
  console.log(currentRound, totalRounds)
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
          <h2 className="text-2xl font-bold text-center text-sky-700 mb-6">
            {currentRound} / {totalRounds} 판
          </h2>

          {/* 현재 판 입력 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {players.map(player => (
              <div
                key={player.id}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <h3 className="text-xl font-bold text-sky-600">
                  {player.name}
                </h3>

                <input
                  type="number"
                  value={currentInputs[player.id] || ""}
                  onChange={(e) =>
                    setCurrentInputs({
                      ...currentInputs,
                      [player.id]: e.target.value
                    })
                  }
                  className="w-full mt-4 p-2 border rounded"
                  placeholder="이번 판 점수"
                />

                <p className="mt-4 font-semibold">
                  누적: {getTotalScore(player.id)}
                </p>
              </div>
            ))}
          </div>

          {/* 점수 테이블 */}
          <div className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
            <table className="w-full text-center border">
              <thead className="bg-sky-200">
                <tr>
                  <th className="p-2 border">플레이어</th>
                  {[...Array(totalRounds)].map((_, i) => (
                    <th key={i} className="p-2 border">
                      {i + 1}판
                    </th>
                  ))}
                  <th className="p-2 border">총합</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id}>
                    <td className="border p-2 font-semibold">
                      {player.name}
                    </td>

                    {[...Array(totalRounds)].map((_, i) => (
                      <td
                        key={i}
                        className="border p-2 cursor-pointer"
                        onClick={() =>
                          setEditing({ playerId: player.id, roundIndex: i })
                        }
                      >
                        {editing &&
                          editing.playerId === player.id &&
                          editing.roundIndex === i ? (
                          <input
                            type="number"
                            autoFocus
                            defaultValue={scores[player.id]?.[i] ?? ""}
                            onBlur={(e) => {
                              handleScoreChange(
                                player.id,
                                i,
                                Number(e.target.value)
                              )
                              setEditing(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleScoreChange(
                                  player.id,
                                  i,
                                  Number(
                                    (e.target as HTMLInputElement).value
                                  )
                                )
                                setEditing(null)
                              }
                            }}
                            className="w-full text-center border rounded"
                          />
                        ) : (
                          scores[player.id]?.[i] ?? "-"
                        )}
                      </td>
                    ))}

                    <td className="border p-2 font-bold">
                      {getTotalScore(player.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-6">
            {currentRound <= totalRounds ? (
              <button
                onClick={nextRound}
                disabled={!isCurrentRoundComplete()}
                className={`px-6 py-3 rounded-xl text-white ${isCurrentRoundComplete()
                  ? "bg-sky-600"
                  : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                다음 판
              </button>
            ) : (
              <div className="text-2xl font-bold text-green-600">
                🎉 게임 종료!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
