package com.TinyPro.service;

import java.util.List;
import java.util.Map;

public interface DemoDataService {

    Map<String, Object> getBoardHome();

    Map<String, Object> getWorkPlan();

    Map<String, Object> getWorkPractice();

    Map<String, Object> getWorkTraining();

    List<Integer> getWorkPracticeChart(Map<String, Object> body);

    Map<String, Object> getUserCenterData(Map<String, Object> query);

    Map<String, Object> getBaseForm();

    Map<String, Object> getStepForm();

    Map<String, Object> getAdvanceForm();

    Map<String, Object> getProfileDetail();

    void saveSubmission(Map<String, Object> payload);
}
