const fs = require('fs')
const path = require('path')

const localesDir = path.join(__dirname, '..', 'src', 'locales')

const translations = {
  zh: {
    'Network Bandwidth':   '网络带宽',
    'Email Send':          '邮件发送',
    'Reset Password':      '重置密码',
    'File Storage':        '文件存储',
    'Document Operations': '文档操作',
    'Max Users':           '最大用户数',
    'Max Quotes':          '最大报价数',
    'Max Shipments':       '最大货件数',
  },
  vi: {
    'Network Bandwidth':   'Băng thông mạng',
    'Email Send':          'Gửi Email',
    'Reset Password':      'Đặt lại mật khẩu',
    'File Storage':        'Lưu trữ tệp',
    'Document Operations': 'Thao tác tài liệu',
    'Max Users':           'Số người dùng tối đa',
    'Max Quotes':          'Số báo giá tối đa',
    'Max Shipments':       'Số lô hàng tối đa',
  },
  ja: {
    'Network Bandwidth':   'ネットワーク帯域幅',
    'Email Send':          'メール送信',
    'Reset Password':      'パスワードリセット',
    'File Storage':        'ファイルストレージ',
    'Document Operations': 'ドキュメント操作',
    'Max Users':           '最大ユーザー数',
    'Max Quotes':          '最大見積数',
    'Max Shipments':       '最大貨物数',
  },
  de: {
    'Network Bandwidth':   'Netzwerkbandbreite',
    'Email Send':          'E-Mail-Versand',
    'Reset Password':      'Passwort zurücksetzen',
    'File Storage':        'Dateispeicher',
    'Document Operations': 'Dokumentenvorgänge',
    'Max Users':           'Maximale Benutzer',
    'Max Quotes':          'Maximale Angebote',
    'Max Shipments':       'Maximale Sendungen',
  },
  ko: {
    'Network Bandwidth':   '네트워크 대역폭',
    'Email Send':          '이메일 발송',
    'Reset Password':      '비밀번호 재설정',
    'File Storage':        '파일 저장소',
    'Document Operations': '문서 작업',
    'Max Users':           '최대 사용자 수',
    'Max Quotes':          '최대 견적 수',
    'Max Shipments':       '최대 화물 수',
  },
  es: {
    'Network Bandwidth':   'Ancho de banda de red',
    'Email Send':          'Envío de correo electrónico',
    'Reset Password':      'Restablecer contraseña',
    'File Storage':        'Almacenamiento de archivos',
    'Document Operations': 'Operaciones de documentos',
    'Max Users':           'Máximo de usuarios',
    'Max Quotes':          'Máximo de cotizaciones',
    'Max Shipments':       'Máximo de envíos',
  },
  ar: {
    'Network Bandwidth':   'عرض نطاق الشبكة',
    'Email Send':          'إرسال البريد الإلكتروني',
    'Reset Password':      'إعادة تعيين كلمة المرور',
    'File Storage':        'تخزين الملفات',
    'Document Operations': 'عمليات المستندات',
    'Max Users':           'الحد الأقصى للمستخدمين',
    'Max Quotes':          'الحد الأقصى للعروض',
    'Max Shipments':       'الحد الأقصى للشحنات',
  },
}

for (const [lang, map] of Object.entries(translations)) {
  const poPath = path.join(localesDir, `${lang}.po`)
  let content = fs.readFileSync(poPath, 'utf8')

  for (const [msgid, msgstr] of Object.entries(map)) {
    const escaped_id  = msgid.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const escaped_str = msgstr.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

    // Replace empty msgstr for this msgid
    const pattern = new RegExp(
      `(msgid "${escaped_id}"\\s*\\nmsgstr )""`,'g'
    )
    const replaced = content.replace(pattern, `$1"${escaped_str}"`)
    if (replaced === content) {
      console.warn(`  [WARN] ${lang}: msgid "${msgid}" not found or already translated`)
    }
    content = replaced
  }

  fs.writeFileSync(poPath, content, 'utf8')
  console.log(`${lang}: updated`)
}

console.log('Done. Run pnpm i18n:compile to regenerate JSON files.')
