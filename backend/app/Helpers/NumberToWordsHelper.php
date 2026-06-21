<?php

namespace App\Helpers;

class NumberToWordsHelper
{
    /**
     * Convert currency float to words (MYR and Cents).
     */
    public static function convert(float $amount): string
    {
        $amount = round($amount, 2);
        // Ensure decimals are parsed correctly even for integer floats
        $formatted = number_format($amount, 2, '.', '');
        $parts = explode('.', $formatted);
        $ringgit = intval($parts[0]);
        $cents = isset($parts[1]) ? intval($parts[1]) : 0;

        $ringgitStr = self::convertInteger($ringgit);
        $words = $ringgitStr ? $ringgitStr . ' Ringgit Malaysia' : '';

        if ($cents > 0) {
            $centsStr = self::convertInteger($cents);
            if ($words) {
                $words .= ' and ' . $centsStr . ' Cents';
            } else {
                $words = $centsStr . ' Cents';
            }
        }

        return $words ? $words . ' Only' : 'Zero Ringgit Malaysia Only';
    }

    /**
     * Recursively convert integer to words.
     */
    private static function convertInteger(int $number): string
    {
        if ($number < 0) {
            return 'Negative ' . self::convertInteger(abs($number));
        }

        if ($number === 0) {
            return '';
        }

        $units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        $tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        $scales = ['', 'Thousand', 'Million', 'Billion'];

        if ($number < 20) {
            return $units[$number];
        }

        if ($number < 100) {
            return $tens[intval($number / 10)] . ($number % 10 ? ' ' . $units[$number % 10] : '');
        }

        if ($number < 1000) {
            return $units[intval($number / 100)] . ' Hundred' . ($number % 100 ? ' ' . self::convertInteger($number % 100) : '');
        }

        $result = '';
        foreach ($scales as $i => $scale) {
            if ($number % 1000 !== 0) {
                $chunk = self::convertInteger($number % 1000);
                $result = $chunk . ($scale ? ' ' . $scale : '') . ($result ? ' ' . $result : '');
            }
            $number = intval($number / 1000);
            if ($number === 0) {
                break;
            }
        }

        return trim($result);
    }
}
