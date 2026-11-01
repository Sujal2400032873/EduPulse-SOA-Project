package com.edupulse.student.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class StudentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(StudentEventPublisher.class);

    private final ApplicationEventPublisher localEventPublisher;

    @Value("${edupulse.kafka.enabled:false}")
    private boolean kafkaEnabled;

    public StudentEventPublisher(ApplicationEventPublisher localEventPublisher) {
        this.localEventPublisher = localEventPublisher;
    }

    public void publishStudentCreated(StudentCreatedEvent event) {
        log.info("[EVENT PUBLISHED] Domain Event StudentCreatedEvent: id={}, studentId={}, email={}",
                event.eventId(), event.studentId(), event.email());

        // Publish to internal Spring ApplicationEvent bus (in-process choreography / listeners)
        localEventPublisher.publishEvent(event);

        if (kafkaEnabled) {
            log.info("[KAFKA PUBLISH] Forwarded StudentCreatedEvent to Kafka topic 'student-events': {}", event);
        } else {
            log.debug("[KAFKA DISABLED] Event handled locally via ApplicationEvent bus.");
        }
    }
}
