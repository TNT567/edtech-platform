package com.edtech.web.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.ParentBinding;
import com.edtech.model.entity.UserSettings;
import com.edtech.model.mapper.ParentBindingMapper;
import com.edtech.model.mapper.UserSettingsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserSettingsMapper settingsMapper;
    private final ParentBindingMapper bindingMapper;

    public UserSettings getSettings(Long userId) {
        UserSettings settings = settingsMapper.selectById(userId);
        if (settings == null) {
            settings = createDefaultSettings(userId);
            settingsMapper.insert(settings);
        }
        return settings;
    }

    @Transactional
    public UserSettings updateSettings(UserSettings settings) {
        // Ensure exists
        if (settingsMapper.selectById(settings.getUserId()) == null) {
            settingsMapper.insert(settings);
        } else {
            settingsMapper.updateById(settings);
        }
        return settings;
    }

    public void bindParent(Long studentId, String inviteCode) {
        // Mock validation: Invite code must be "PARENT123" or similar
        // In real app, we'd lookup parent by code
        if (!"PARENT888".equals(inviteCode)) {
            throw new RuntimeException("Invalid invitation code");
        }
        
        // Mock parent ID
        Long parentId = 999L; 

        ParentBinding binding = new ParentBinding();
        binding.setStudentId(studentId);
        binding.setParentId(parentId);
        binding.setStatus("ACTIVE");
        binding.setPermissions("{\"radar\":true,\"history\":true,\"report\":true}");
        binding.setDailyTimeLimit(120);
        
        try {
            bindingMapper.insert(binding);
        } catch (Exception e) {
            throw new RuntimeException("Already bound or system error");
        }
    }

    private UserSettings createDefaultSettings(Long userId) {
        UserSettings s = new UserSettings();
        s.setUserId(userId);
        s.setNickname("Learner");
        s.setDailyGoal(30);
        s.setDifficultyPreference(50);
        s.setStrategyWeights("{\"mistake\":30,\"weakness\":30,\"review\":20,\"advance\":20}");
        s.setCorrectionMode(false);
        s.setDurationReminder(false);
        s.setNightPause(true);
        s.setNotifyDaily(true);
        s.setTheme("system");
        s.setFontSize("medium");
        s.setPrivacyVisibility("private");
        return s;
    }
}
