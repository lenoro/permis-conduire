package com.permis.repository;

import com.permis.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCandidatIdOrderByDateEnvoiDesc(Long candidatId);
}
