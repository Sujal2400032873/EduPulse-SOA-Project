package com.edupulse.result.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class GradeCalculatorTest {

    @Test
    @DisplayName("Should calculate exact percentage to two decimal places")
    void testCalculatePercentage() {
        BigDecimal marks = new BigDecimal("92.5");
        BigDecimal maxMarks = new BigDecimal("100.0");

        BigDecimal percentage = GradeCalculator.calculatePercentage(marks, maxMarks);

        assertThat(percentage).isEqualByComparingTo("92.50");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException if maxMarks is zero or negative")
    void testZeroMaxMarks() {
        assertThatThrownBy(() -> GradeCalculator.calculatePercentage(BigDecimal.TEN, BigDecimal.ZERO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Maximum marks must be greater than zero");
    }

    @ParameterizedTest(name = "Percentage {0} should map to grade {1} and grade point {2}")
    @CsvSource({
            "95.0, O, 10",
            "89.9, A+, 9",
            "75.5, A, 8",
            "63.0, B+, 7",
            "52.0, B, 6",
            "41.0, C, 5",
            "35.0, F, 0"
    })
    void testGradeAndGradePoints(double pct, String expectedGrade, int expectedGradePoint) {
        BigDecimal percentage = BigDecimal.valueOf(pct);
        String grade = GradeCalculator.calculateGrade(percentage);
        BigDecimal gradePoint = GradeCalculator.calculateGradePoint(grade);

        assertThat(grade).isEqualTo(expectedGrade);
        assertThat(gradePoint).isEqualByComparingTo(BigDecimal.valueOf(expectedGradePoint));
    }
}
