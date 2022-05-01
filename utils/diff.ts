import { WebPage } from '@pagenote/shared/lib/@types/data'

export enum DiffType {
  equal = 0, // 相同
  ahead = 1, // 超前
  behand = -1, // 落后
}

interface Diff {
  diffType: DiffType
  timeDiff: number
  hoursDiff: number
  daysDiff: number
}

export const diffWebPages = function (
  currentPage: WebPage | undefined | null,
  comparePage: WebPage | undefined | null
): Diff {
  const diffTime =
    +(currentPage?.updateAt || currentPage?.createAt || 0) -
    +(comparePage?.updateAt || comparePage?.createAt || 0)

  const hoursDiff = diffTime / 1000 / 3600
  const diff: Diff = {
    timeDiff: diffTime,
    hoursDiff,
    daysDiff: hoursDiff / 24,
    diffType: DiffType.equal,
  }

  if (diffTime === 0) {
    diff.diffType = DiffType.equal
  } else if (diffTime > 0) {
    diff.diffType = DiffType.ahead
  } else if (diffTime < 0) {
    diff.diffType = DiffType.behand
  }

  return diff
}
