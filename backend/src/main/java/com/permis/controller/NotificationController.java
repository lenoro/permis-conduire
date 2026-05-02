package com.permis.controller;

import com.permis.entity.Notification;
import com.permis.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidats/{candidatId}/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "https://permis.infserv.ca"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications(@PathVariable Long candidatId) {
        return notificationService.findByCandidat(candidatId);
    }

    @PostMapping
    public Notification addNotification(@PathVariable Long candidatId,
                                        @RequestBody Notification notification) {
        return notificationService.creerNotificationManuelle(candidatId, notification);
    }
}
