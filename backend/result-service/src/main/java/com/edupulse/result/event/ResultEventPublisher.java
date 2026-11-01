package com.edupulse.result.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class ResultEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ResultEventPublisher.class);
    private final ApplicationEventPublisher applicationEventPublisher;

    public ResultEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void publishResultPublished(ResultPublishedEvent event) {
        log.info("[EVENT PUBLISHED] Domain Event ResultPublishedEvent: id={}, studentId={}, subjectCode={}, grade={}, percentage={}%",
                event.eventId(), event.studentId(), event.subjectCode(), event.grade(), event.percentage());

        try {
            if (applicationEventPublisher != null) {
                applicationEventPublisher.publishEvent(event);
            }
        } catch (Exception e) {
            log.warn("[EVENT DISPATCH FALLBACK] Local event dispatch failed: {}. Continuing without breaking transaction.", e.getMessage());
        }
    }
}
