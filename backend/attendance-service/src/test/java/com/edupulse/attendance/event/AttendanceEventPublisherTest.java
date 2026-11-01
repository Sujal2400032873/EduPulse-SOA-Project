package com.edupulse.attendance.event;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class AttendanceEventPublisherTest {

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @InjectMocks
    private AttendanceEventPublisher publisher;

    @Test
    @DisplayName("Should publish AttendanceRecordedEvent without exception")
    void shouldPublishAttendanceRecordedEvent() {
        AttendanceRecordedEvent event = AttendanceRecordedEvent.of(
                "STU1001", "CS101", LocalDate.now(), "PRESENT", "FACULTY1"
        );

        publisher.publishAttendanceRecorded(event);

        verify(applicationEventPublisher, times(1)).publishEvent(any(AttendanceRecordedEvent.class));
        assertThat(event.studentId()).isEqualTo("STU1001");
        assertThat(event.eventType()).isEqualTo("AttendanceRecorded");
    }
}
