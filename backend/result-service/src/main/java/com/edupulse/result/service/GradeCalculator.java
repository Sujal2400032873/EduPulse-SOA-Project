package com.edupulse.result.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class GradeCalculator {

    public static BigDecimal calculatePercentage(
            BigDecimal marks,
            BigDecimal maxMarks) {

        if (maxMarks == null || maxMarks.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Maximum marks must be greater than zero");
        }

        return marks
                .divide(maxMarks, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public static String calculateGrade(BigDecimal percentage) {

        double p = percentage.doubleValue();

        if (p >= 90) {
            return "O";
        } else if (p >= 80) {
            return "A+";
        } else if (p >= 70) {
            return "A";
        } else if (p >= 60) {
            return "B+";
        } else if (p >= 50) {
            return "B";
        } else if (p >= 40) {
            return "C";
        } else {
            return "F";
        }
    }

    public static BigDecimal calculateGradePoint(String grade) {

        return switch (grade) {
            case "O" -> BigDecimal.TEN;
            case "A+" -> BigDecimal.valueOf(9);
            case "A" -> BigDecimal.valueOf(8);
            case "B+" -> BigDecimal.valueOf(7);
            case "B" -> BigDecimal.valueOf(6);
            case "C" -> BigDecimal.valueOf(5);
            case "F" -> BigDecimal.ZERO;
            default -> throw new IllegalArgumentException(
                    "Invalid grade: " + grade);
        };
    }
}