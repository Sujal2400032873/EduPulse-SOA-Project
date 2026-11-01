package com.edupulse.result.event;

import java.math.BigDecimal;

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
class ResultEventPublisherTest {

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @InjectMocks
    private ResultEventPublisher publisher;

    @Test
    @DisplayName("Should publish ResultPublishedEvent safely")
    void shouldPublishResultPublishedEvent() {
        ResultPublishedEvent event = ResultPublishedEvent.of(
                "2400030001",
                "CS101",
                "Intro to CS",
                1,
                new BigDecimal("95.00"),
                new BigDecimal("100.00"),
                new BigDecimal("95.00"),
                "O",
                "FACULTY1"
        );

        publisher.publishResultPublished(event);

        verify(applicationEventPublisher, times(1)).publishEvent(any(ResultPublishedEvent.class));
        assertThat(event.studentId()).isEqualTo("2400030001");
        assertThat(event.grade()).isEqualTo("O");
        assertThat(event.eventType()).isEqualTo("ResultPublished");
    }
}
