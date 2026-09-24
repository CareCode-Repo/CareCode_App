import { ReactElement } from 'react'
import Chip from '@/components/common/Chip'
import { HealthRecord, RECORD_TYPE_LABEL, RecordType } from '@/types/apis/health'
import { formatDate } from '@/utils/date'

interface HealthRecordCardProps {
  record: HealthRecord
  onClick?: () => void
}

const TYPE_COLOR: Record<string, 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'white'> = {
  VACCINATION: 'green',
  CHECKUP: 'blue',
  GROWTH: 'blue',
  DENTAL: 'blue',
  EYE: 'blue',
  MEDICATION: 'purple',
  ILLNESS: 'yellow',
  SYMPTOM: 'yellow',
  EMERGENCY: 'red',
  OTHER: 'white',
}

const HealthRecordCard = ({ record, onClick }: HealthRecordCardProps): ReactElement => {
  const typeLabel = RECORD_TYPE_LABEL[record.recordType as RecordType] ?? record.recordType

  // 측정값은 있는 것만 모아 한 줄로 요약한다.
  const measurements = [
    record.height != null && `키 ${record.height}cm`,
    record.weight != null && `몸무게 ${record.weight}kg`,
    record.temperature != null && `체온 ${record.temperature}℃`,
  ].filter(Boolean) as string[]

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <Chip color={TYPE_COLOR[record.recordType] ?? 'white'}>{typeLabel}</Chip>
        <span className="text-b1-semibold truncate text-gray-800">{record.title}</span>
      </div>

      <div className="text-b2-regular flex items-center gap-2 text-gray-600">
        <span>{formatDate(record.recordDate)}</span>
        {record.childName && (
          <>
            <span aria-hidden>·</span>
            <span>{record.childName}</span>
          </>
        )}
        {record.hospitalName && (
          <>
            <span aria-hidden>·</span>
            <span className="truncate">{record.hospitalName}</span>
          </>
        )}
      </div>

      {measurements.length > 0 && (
        <p className="text-c1-regular text-gray-700">{measurements.join(' · ')}</p>
      )}

      {record.nextDate && (
        <p className="text-c1-regular text-green-700">{`다음 예정 ${formatDate(record.nextDate)}`}</p>
      )}
    </button>
  )
}

export default HealthRecordCard
