package com.edupulse.attendance.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class AttendanceEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(AttendanceEventPublisher.class);
    private final ApplicationEventPublisher applicationEventPublisher;

    public AttendanceEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void publishAttendanceRecorded(AttendanceRecordedEvent event) {
        log.info("[EVENT PUBLISHED] Domain Event AttendanceRecordedEvent: id={}, studentId={}, subject={}, date={}, status={}",
                event.eventId(), event.studentId(), event.subject(), event.date(), event.status());

        try {
            if (applicationEventPublisher != null) {
                applicationEventPublisher.publishEvent(event);
            }
        } catch (Exception e) {
            log.warn("[EVENT DISPATCH FALLBACK] Local event dispatch failed: {}. Continuing without breaking transaction.", e.getMessage());
        }
    }
}
