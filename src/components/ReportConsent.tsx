import { Switch, Text, View } from 'react-native'

export function ReportConsent({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <View>
    <Text>نرسل ملف التقرير كاملًا، بما فيه أي بيانات شخصية ظاهرة، إلى Anthropic لاستخراج التحاليل. تُحفظ النتائج في Supabase. يمكنك إخفاء بياناتك التعريفية قبل الرفع.</Text>
    <Switch accessibilityLabel="أوافق على إرسال التقرير إلى Anthropic لتحليله" value={value} onValueChange={onChange} />
    <Text>أوافق على إرسال التقرير إلى Anthropic لتحليله.</Text>
  </View>
}
