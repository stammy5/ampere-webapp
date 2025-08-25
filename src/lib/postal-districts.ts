// Singapore Postal Code to District Mapping
// Based on Singapore postal code system where first 2 digits determine the district

export const SINGAPORE_POSTAL_DISTRICTS: Record<string, string> = {
  // Central Business District & City Center
  '01': 'Downtown Core',
  '02': 'Downtown Core', 
  '03': 'Downtown Core',
  '04': 'Downtown Core',
  '05': 'Downtown Core',
  '06': 'Downtown Core',
  '07': 'Downtown Core',
  '08': 'Downtown Core',
  '09': 'Orchard',
  '10': 'Orchard',
  '11': 'Newton',
  '12': 'Novena',
  '13': 'Newton',
  '14': 'Orchard',
  '15': 'Orchard',
  '16': 'Bukit Timah',
  '17': 'Bukit Timah',
  '18': 'Novena',
  '19': 'Novena',
  '20': 'Bishan',
  '21': 'Bishan',
  '22': 'Ang Mo Kio',
  '23': 'Bishan',
  '24': 'Ang Mo Kio',
  '25': 'Ang Mo Kio',
  '26': 'Ang Mo Kio',
  '27': 'Ang Mo Kio',
  '28': 'Sengkang',
  '29': 'Serangoon',
  '30': 'Serangoon',
  '31': 'Serangoon',
  '32': 'Hougang',
  '33': 'Hougang',
  '34': 'Hougang',
  '35': 'Tampines',
  '36': 'Tampines',
  '37': 'Tampines',
  '38': 'Pasir Ris',
  '39': 'Tampines',
  '40': 'Geylang',
  '41': 'Geylang',
  '42': 'Geylang',
  '43': 'Marine Parade',
  '44': 'Marine Parade',
  '45': 'Marine Parade',
  '46': 'Bedok',
  '47': 'Bedok',
  '48': 'Bedok',
  '49': 'Bedok',
  '50': 'Bedok',
  '51': 'Bedok',
  '52': 'Bedok',
  '53': 'Pasir Ris',
  '54': 'Pasir Ris',
  '55': 'Tampines',
  '56': 'Tampines',
  '57': 'Tampines',
  '58': 'Pasir Ris',
  '59': 'Changi',
  '60': 'Jurong East',
  '61': 'Jurong West',
  '62': 'Jurong West',
  '63': 'Jurong West',
  '64': 'Jurong West',
  '65': 'Jurong West',
  '66': 'Jurong West',
  '67': 'Choa Chu Kang',
  '68': 'Choa Chu Kang',
  '69': 'Choa Chu Kang',
  '70': 'Bukit Panjang',
  '71': 'Bukit Panjang',
  '72': 'Bukit Batok',
  '73': 'Bukit Batok',
  '74': 'Bukit Batok',
  '75': 'Clementi',
  '76': 'Clementi',
  '77': 'Queenstown',
  '78': 'Queenstown',
  '79': 'Tuas',
  '80': 'Southern Islands',
  '81': 'Southern Islands',
  '82': 'Southern Islands'
}

export function getDistrictFromPostalCode(postalCode: string): string {
  if (!postalCode || postalCode.length < 2) {
    return ''
  }
  
  // Clean postal code and get first 2 digits
  const cleanedCode = postalCode.replace(/\D/g, '')
  const firstTwoDigits = cleanedCode.substring(0, 2)
  
  return SINGAPORE_POSTAL_DISTRICTS[firstTwoDigits] || ''
}

export function validateSingaporePostalCode(postalCode: string): boolean {
  const cleanedCode = postalCode.replace(/\D/g, '')
  return cleanedCode.length === 6 && /^\d{6}$/.test(cleanedCode)
}